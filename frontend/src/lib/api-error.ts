import type { ValidationErrors } from "@/lib/types";

/**
 * Lives apart from `api.ts` because that module is `server-only`. The browser-side
 * query layer needs to recognise API failures too, and importing it from there would
 * drag the server client — and the session token it reads — into the client bundle.
 */
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
