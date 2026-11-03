/**
 * A small validator with Laravel's semantics, because the frontend renders Laravel's
 * messages verbatim and the 422 shape has to match.
 *
 * - Fields are checked in declaration order and every rule runs (no bail), except
 *   that a failed implicit rule (`required`) skips the rest for that field.
 * - A non-implicit rule is skipped when the key is absent. A present `null` skips the
 *   rules only if the field is `nullable`.
 * - `sometimes` skips the field entirely when the key is absent.
 * - `items.*` expands per element, with errors keyed `items.0`, `items.1`, ...
 * - The validated output holds only the keys that were present in the input.
 */
import { validationError } from "./http";

export type Input = Record<string, unknown>;

interface RuleContext {
  value: unknown;
  key: string;
  attribute: string;
  data: Input;
  /** Every rule name on this field, for type-dependent rules like `max`. */
  siblings: string[];
}

export interface Rule {
  name: string;
  implicit?: boolean;
  /** Returns the failure message, or null when the value passes. */
  run(ctx: RuleContext): string | null | Promise<string | null>;
}

type Rules = Record<string, Array<Rule | "sometimes" | "nullable">>;

const SNIFF: Array<[string, (b: Uint8Array) => boolean]> = [
  ["jpg", (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff],
  ["png", (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47],
  ["gif", (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38],
  ["bmp", (b) => b[0] === 0x42 && b[1] === 0x4d],
  [
    "webp",
    (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  ],
  ["pdf", (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46],
];

export const MIME_FOR: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  pdf: "application/pdf",
};

/** The extension a file's bytes say it has, ignoring its name and declared type. */
export async function sniffExtension(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return SNIFF.find(([, test]) => test(head))?.[0] ?? null;
}

const length = (s: string) => [...s].length;

function isNumeric(value: unknown): boolean {
  return (
    (typeof value === "number" && Number.isFinite(value)) ||
    (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value)))
  );
}

function sizeOf(ctx: RuleContext): { size: number; kind: "string" | "array" | "file" | "numeric" } {
  const { value } = ctx;
  if (value instanceof File) return { size: value.size / 1024, kind: "file" };
  if (Array.isArray(value)) return { size: value.length, kind: "array" };
  if (isNumeric(value) && (ctx.siblings.includes("numeric") || ctx.siblings.includes("integer"))) {
    return { size: Number(value), kind: "numeric" };
  }
  return { size: length(String(value ?? "")), kind: "string" };
}

function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "") ||
    (Array.isArray(value) && value.length === 0) ||
    (value instanceof File && value.size === 0 && value.name === "")
  );
}

export const required = (): Rule => ({
  name: "required",
  implicit: true,
  run: ({ value, attribute }) => (isEmpty(value) ? `The ${attribute} field is required.` : null),
});

export const string = (): Rule => ({
  name: "string",
  run: ({ value, attribute }) =>
    typeof value === "string" ? null : `The ${attribute} field must be a string.`,
});

export const integer = (): Rule => ({
  name: "integer",
  run: ({ value, attribute }) =>
    isNumeric(value) && Number.isInteger(Number(value))
      ? null
      : `The ${attribute} field must be an integer.`,
});

export const numeric = (): Rule => ({
  name: "numeric",
  run: ({ value, attribute }) =>
    isNumeric(value) ? null : `The ${attribute} field must be a number.`,
});

export const boolean = (): Rule => ({
  name: "boolean",
  run: ({ value, attribute }) =>
    [true, false, 0, 1, "0", "1"].includes(value as never)
      ? null
      : `The ${attribute} field must be true or false.`,
});

export const array = (): Rule => ({
  name: "array",
  run: ({ value, attribute }) =>
    Array.isArray(value) ? null : `The ${attribute} field must be an array.`,
});

export const max = (limit: number): Rule => ({
  name: "max",
  run: (ctx) => {
    const { size, kind } = sizeOf(ctx);
    if (size <= limit) return null;
    const a = ctx.attribute;
    if (kind === "file") return `The ${a} field must not be greater than ${limit} kilobytes.`;
    if (kind === "array") return `The ${a} field must not have more than ${limit} items.`;
    if (kind === "numeric") return `The ${a} field must not be greater than ${limit}.`;
    return `The ${a} field must not be greater than ${limit} characters.`;
  },
});

export const min = (limit: number): Rule => ({
  name: "min",
  run: (ctx) => {
    const { size, kind } = sizeOf(ctx);
    if (size >= limit) return null;
    const a = ctx.attribute;
    if (kind === "file") return `The ${a} field must be at least ${limit} kilobytes.`;
    if (kind === "array") return `The ${a} field must have at least ${limit} items.`;
    if (kind === "numeric") return `The ${a} field must be at least ${limit}.`;
    return `The ${a} field must be at least ${limit} characters.`;
  },
});

export const email = (): Rule => ({
  name: "email",
  run: ({ value, attribute }) =>
    typeof value === "string" && /^[^\s@]+@[^\s@]+$/.test(value)
      ? null
      : `The ${attribute} field must be a valid email address.`,
});

export const url = (): Rule => ({
  name: "url",
  run: ({ value, attribute }) => {
    const message = `The ${attribute} field must be a valid URL.`;
    if (typeof value !== "string" || !/^[a-z][a-z0-9+.-]*:\/\/[^\s/?#]+\S*$/i.test(value)) {
      return message;
    }
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },
});

export const regex = (pattern: RegExp): Rule => ({
  name: "regex",
  run: ({ value, attribute }) =>
    typeof value === "string" && pattern.test(value)
      ? null
      : `The ${attribute} field format is invalid.`,
});

export const oneOf = (values: readonly string[]): Rule => ({
  name: "enum",
  run: ({ value, attribute }) =>
    typeof value === "string" && values.includes(value)
      ? null
      : `The selected ${attribute} is invalid.`,
});

export const confirmed = (): Rule => ({
  name: "confirmed",
  run: ({ value, key, attribute, data }) =>
    data[`${key}_confirmation`] === value
      ? null
      : `The ${attribute} field confirmation does not match.`,
});

export const uuid = (): Rule => ({
  name: "uuid",
  run: ({ value, attribute }) =>
    typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
      ? null
      : `The ${attribute} field must be a valid UUID.`,
});

export const date = (): Rule => ({
  name: "date",
  run: ({ value, attribute }) =>
    typeof value === "string" && !Number.isNaN(Date.parse(value))
      ? null
      : `The ${attribute} field must be a valid date.`,
});

export const afterOrEqual = (other: string): Rule => ({
  name: "after_or_equal",
  run: ({ value, attribute, data }) => {
    const left = Date.parse(String(value));
    const right = Date.parse(String(data[other] ?? ""));
    return !Number.isNaN(left) && !Number.isNaN(right) && left >= right
      ? null
      : `The ${attribute} field must be a date after or equal to ${other.replace(/_/g, " ")}.`;
  },
});

export const unique = (taken: (value: unknown) => Promise<boolean>): Rule => ({
  name: "unique",
  run: async ({ value, attribute }) =>
    (await taken(value)) ? `The ${attribute} has already been taken.` : null,
});

export const check = (
  name: string,
  passes: (value: unknown, data: Input) => boolean | Promise<boolean>,
  message: string,
): Rule => ({
  name,
  run: async ({ value, data }) => ((await passes(value, data)) ? null : message),
});

export const file = (): Rule => ({
  name: "file",
  run: ({ value, attribute }) =>
    value instanceof File ? null : `The ${attribute} field must be a file.`,
});

export const image = (): Rule => ({
  name: "image",
  run: async ({ value, attribute }) => {
    const ext = value instanceof File ? await sniffExtension(value) : null;
    return ext && ["jpg", "png", "gif", "bmp", "webp"].includes(ext)
      ? null
      : `The ${attribute} field must be an image.`;
  },
});

export const mimes = (...extensions: string[]): Rule => ({
  name: "mimes",
  run: async ({ value, attribute }) => {
    const ext = value instanceof File ? await sniffExtension(value) : null;
    const allowed = extensions.map((e) => (e === "jpeg" ? "jpg" : e));
    return ext && allowed.includes(ext)
      ? null
      : `The ${attribute} field must be a file of type: ${extensions.join(", ")}.`;
  },
});

const displayName = (key: string) => key.replace(/_/g, " ");

/**
 * Throws a 422 in Laravel's shape on failure; otherwise returns the validated keys.
 * `messages` overrides by `field.rule`, e.g. `{ "email.regex": "..." }`.
 */
export async function validate(
  data: Input,
  rules: Rules,
  messages: Record<string, string> = {},
): Promise<Input> {
  const errors: Record<string, string[]> = {};
  const validated: Input = {};

  for (const [field, list] of Object.entries(rules)) {
    const keys = field.includes("*")
      ? expand(data, field.split("."))
      : [{ key: field, present: field in data, value: data[field] }];

    for (const { key, present, value } of keys) {
      const sometimes = list.includes("sometimes");
      const nullable = list.includes("nullable");
      if (sometimes && !present) continue;
      if (present && !field.includes(".")) validated[field] = value;

      const actual = list.filter((r): r is Rule => typeof r !== "string");
      const siblings = actual.map((r) => r.name);
      for (const rule of actual) {
        if (!rule.implicit && (!present || (nullable && value === null))) continue;
        const failure = await rule.run({
          value,
          key,
          attribute: displayName(key),
          data,
          siblings,
        });
        if (!failure) continue;
        const custom = messages[`${field}.${rule.name}`];
        (errors[key] ??= []).push(custom ?? failure);
        if (rule.implicit) break;
      }
    }
  }

  if (Object.keys(errors).length > 0) throw validationError(errors);
  return validated;
}

/** Every concrete path a `a.*.b` pattern matches; the last segment may be absent. */
function expand(data: unknown, segments: string[], prefix: string[] = []) {
  const out: Array<{ key: string; present: boolean; value: unknown }> = [];
  const [head, ...rest] = segments;
  if (head === undefined) return out;
  const container = data && typeof data === "object" ? (data as Record<string, unknown>) : null;

  const keys = head === "*" ? (Array.isArray(container) ? container.map((_, i) => String(i)) : []) : [head];
  for (const key of keys) {
    const present = container !== null && key in container;
    const value = present ? container![key] : undefined;
    if (rest.length === 0) out.push({ key: [...prefix, key].join("."), present, value });
    else if (present) out.push(...expand(value, rest, [...prefix, key]));
  }
  return out;
}

/** Laravel's boolean cast for a value that passed the `boolean` rule. */
export function toBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}
