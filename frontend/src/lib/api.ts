import "server-only";

import { getToken } from "@/lib/session";
import type { ValidationErrors } from "@/lib/types";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors: ValidationErrors = {},
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip the Authorization header even when a session exists. */
  anonymous?: boolean;
  /** Send `body` as-is (a FormData) instead of JSON — for file uploads. */
  multipart?: boolean;
}

/**
 * Call the Laravel API. Runs on the server only, so the bearer token never reaches
 * the browser.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, anonymous, multipart, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  // Never set Content-Type for multipart: fetch has to generate the boundary itself.
  if (body !== undefined && !multipart) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!anonymous) {
    const token = await getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : multipart
          ? (body as BodyInit)
          : JSON.stringify(body),
    cache: init.cache ?? "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? `Request to ${path} failed with ${response.status}.`,
      payload?.errors ?? {},
    );
  }

  return payload as T;
}

/**
 * Turn any thrown error into the shape a form can render, so server actions do not
 * each repeat the same try/catch.
 */
export function toFormState(error: unknown): { message: string; errors: ValidationErrors } {
  if (error instanceof ApiError) {
    return { message: error.message, errors: error.errors };
  }

  return {
    message: "Could not reach the PHive API. Is the backend running?",
    errors: {},
  };
}
