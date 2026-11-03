/**
 * Errors and request input, shaped the way Laravel renders them for `api/*` paths
 * (backend/bootstrap/app.php), because the frontend reads `message` and `errors`.
 */
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    message: string,
    readonly body: Record<string, unknown> = { message },
    readonly headers: Record<string, string> = {},
  ) {
    super(message);
  }
}

/** `abort(403)` renders `{"message": ""}`; `abort(403, "X")` renders `{"message": "X"}`. */
export function abort(status: ContentfulStatusCode, message = ""): never {
  throw new HttpError(status, message);
}

/** Route-model binding miss, worded as Laravel's ModelNotFoundException. */
export function modelNotFound(model: string, value: string): never {
  throw new HttpError(404, `No query results for model [App\\Models\\${model}] ${value}`);
}

/** "<first message> (and N more errors)" over every field, in order. */
export function validationError(errors: Record<string, string[]>): HttpError {
  const all = Object.values(errors).flat();
  const rest = all.length - 1;
  const suffix = rest === 1 ? " (and 1 more error)" : rest > 1 ? ` (and ${rest} more errors)` : "";
  const message = `${all[0] ?? "The given data was invalid."}${suffix}`;
  return new HttpError(422, message, { message, errors });
}

/** One message on one field, like `ValidationException::withMessages`. */
export function fieldError(field: string, message: string, status: ContentfulStatusCode = 422) {
  return new HttpError(status, message, { message, errors: { [field]: [message] } });
}

const PRESERVED = new Set(["current_password", "password", "password_confirmation"]);

/** TrimStrings + ConvertEmptyStringsToNull, recursively. */
function normalise(value: unknown, key?: string): unknown {
  if (typeof value === "string") {
    const trimmed = key && PRESERVED.has(key) ? value : value.replace(/^[\s﻿​‎]+|[\s﻿​‎]+$/g, "");
    return trimmed === "" ? null : trimmed;
  }
  if (Array.isArray(value)) return value.map((v) => normalise(v));
  if (value && typeof value === "object" && !(value instanceof File)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalise(v, k)]));
  }
  return value;
}

/** JSON, urlencoded or multipart body; an unparsable body is `{}`, like Laravel. */
export async function readInput(c: Context): Promise<Record<string, unknown>> {
  const type = c.req.header("content-type") ?? "";
  let body: Record<string, unknown> = {};
  try {
    if (type.includes("multipart/form-data") || type.includes("application/x-www-form-urlencoded")) {
      const form = await c.req.formData();
      for (const key of new Set(form.keys())) {
        const values = form.getAll(key);
        const name = key.endsWith("[]") ? key.slice(0, -2) : key;
        body[name] = key.endsWith("[]") || values.length > 1 ? values : values[0];
      }
    } else {
      const text = await c.req.text();
      const parsed: unknown = text ? JSON.parse(text) : {};
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    }
  } catch {
    body = {};
  }
  return normalise({ ...c.req.query(), ...body }) as Record<string, unknown>;
}

/**
 * Carbon's JSON format: UTC with six fractional digits. Laravel's columns hold whole
 * seconds, so the fraction is always zero.
 */
export function iso(value: Date | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const date = typeof value === "number" ? new Date(value) : value;
  return `${date.toISOString().slice(0, 19)}.000000Z`;
}

/** A `date` column (YYYY-MM-DD) as Carbon serialises it: midnight UTC. */
export function isoDate(value: string | null | undefined): string | null {
  return value ? `${value.slice(0, 10)}T00:00:00.000000Z` : null;
}
