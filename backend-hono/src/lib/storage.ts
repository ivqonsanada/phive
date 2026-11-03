/**
 * Uploads live in R2 under the same keys Laravel's public disk used (`avatars/...`,
 * `cv/...`, `project-thumbnails/...`), and the Worker serves them at `/storage/<key>` — the
 * URL shape `php artisan storage:link` produced — so stored paths and the frontend's
 * image allow-list carry over unchanged.
 */
import type { Bindings } from "../env";
import { randomString } from "./auth";
import { MIME_FOR, sniffExtension } from "./validator";

/**
 * `<dir>/<40 random chars>.<ext>`, with the extension taken from the file's bytes
 * (the validator already refused anything else), never from the client's name or type.
 */
export async function storeUpload(env: Bindings, directory: string, file: File): Promise<string> {
  const ext = (await sniffExtension(file)) ?? "bin";
  const key = `${directory}/${randomString(40)}.${ext}`;
  await env.UPLOADS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: MIME_FOR[ext] ?? "application/octet-stream" },
  });
  return key;
}

/** StoredFile::replace: the old file goes first, then the new one is stored. */
export async function replaceUpload(env: Bindings, old: string | null, directory: string, file: File) {
  await deleteUpload(env, old);
  return storeUpload(env, directory, file);
}

export async function deleteUpload(env: Bindings, key: string | null | undefined): Promise<void> {
  // Seeded rows point at external URLs (pravatar, picsum); only our own keys are ours to delete.
  if (key && !/^https?:\/\//.test(key)) await env.UPLOADS.delete(key);
}

/** A stored value as a public URL: external URLs pass through untouched. */
export function storageUrl(env: Bindings, key: string | null | undefined): string | null {
  if (!key) return null;
  if (/^https?:\/\//.test(key)) return key;
  return `${env.APP_URL.replace(/\/$/, "")}/storage/${key}`;
}

/** GET /storage/<key> */
export async function serveUpload(env: Bindings, key: string): Promise<Response> {
  const object = await env.UPLOADS.get(key);
  if (!object) return new Response("Not Found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  // Keys are never reused (each upload gets a fresh UUID), so they can be cached forever.
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}
