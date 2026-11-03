import { Hono } from "hono";

import { createDb } from "./db/client";
import type { AppEnv } from "./env";
import { resolveUser } from "./lib/auth";
import { cors, frontendOrigins } from "./lib/cors";
import { HttpError } from "./lib/http";
import { serveUpload } from "./lib/storage";
import { authRoutes } from "./routes/auth";
import { myProjectRoutes } from "./routes/my-projects";
import { partyRoutes } from "./routes/party";
import { publicRoutes } from "./routes/public";
import { settingsRoutes } from "./routes/settings";
import { projectBoxRoutes, workflowRoutes } from "./routes/workflow";

export const app = new Hono<AppEnv>();

app.use("/api/*", cors);
app.use("*", async (c, next) => {
  c.set("db", createDb(c.env.DB));
  await next();
});
app.use("/api/*", resolveUser);
app.use("/broadcasting/*", resolveUser);

app.get("/", (c) => {
  const root = new URL(c.req.url).origin;
  return c.json({
    name: "PHive",
    api: `${root}/api`,
    health: `${root}/up`,
    frontend: frontendOrigins(c.env.FRONTEND_URL)[0] ?? null,
  });
});
app.get("/up", (c) => c.html("<!doctype html><title>PHive</title><p>Application up</p>"));
app.get("/storage/*", (c) => serveUpload(c.env, decodeURIComponent(c.req.path.slice("/storage/".length))));

app.route("/api", authRoutes);
app.route("/api", publicRoutes);
app.route("/api/settings", settingsRoutes);
app.route("/api/my/projects", myProjectRoutes);
app.route("/api", partyRoutes);
app.route("/api", projectBoxRoutes);
app.route("/api/my/projects", workflowRoutes);

const jsonPath = (path: string) => path.startsWith("/api/") || path.startsWith("/broadcasting/");

app.onError((error, c) => {
  if (error instanceof HttpError) {
    for (const [name, value] of Object.entries(error.headers)) c.header(name, value);
    return jsonPath(c.req.path) ? c.json(error.body, error.status) : c.text(error.message || "Error", error.status);
  }
  console.error(error);
  return jsonPath(c.req.path) ? c.json({ message: "Server Error" }, 500) : c.text("Server Error", 500);
});

const METHOD_ORDER = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

/** Hono path patterns (`:name`, `:name{regex}`, `*`) as anchored regexes. */
function patternToRegex(path: string): RegExp {
  let out = "";
  for (let i = 0; i < path.length; i++) {
    const ch = path[i]!;
    if (ch === ":") {
      let j = i + 1;
      while (j < path.length && /\w/.test(path[j]!)) j++;
      if (path[j] === "{") {
        const end = path.indexOf("}", j);
        out += `(${path.slice(j + 1, end)})`;
        i = end;
      } else {
        out += "([^/]+)";
        i = j - 1;
      }
    } else if (ch === "*") {
      out += ".*";
    } else {
      out += ch.replace(/[.+?^$()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${out}$`);
}

/** Laravel's 404 for an unknown route, and its 405 when only the method is wrong. */
app.notFound((c) => {
  const path = c.req.path;
  const methods = new Set<string>();
  for (const route of app.routes) {
    if (route.method === "ALL") continue;
    if (patternToRegex(route.path).test(path)) {
      methods.add(route.method);
      if (route.method === "GET") methods.add("HEAD");
    }
  }

  const bare = path.replace(/^\//, "");
  if (methods.size > 0) {
    const allowed = METHOD_ORDER.filter((m) => methods.has(m)).join(", ");
    c.header("Allow", allowed);
    const message = `The ${c.req.method} method is not supported for route ${bare}. Supported methods: ${allowed}.`;
    return jsonPath(path) ? c.json({ message }, 405) : c.text(message, 405);
  }

  const message = `The route ${bare} could not be found.`;
  return jsonPath(path) ? c.json({ message }, 404) : c.text("Not Found", 404);
});
