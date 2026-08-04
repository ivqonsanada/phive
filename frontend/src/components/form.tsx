"use client";

import { useFormStatus } from "react-dom";

import type { ValidationErrors } from "@/lib/types";

/**
 * The original had two field treatments and used them deliberately.
 *
 * `labelled` (the default) is `form-group__input-text`: a bold label over a plain
 * #f1f1f1 box, used everywhere a field needs naming — register, apply, settings.
 * `accent` is the sign-in treatment: no label at all, the placeholder carries the name
 * and a 6px navy edge carries the emphasis.
 */
export function Field({
  label,
  name,
  errors,
  variant = "labelled",
  hint,
  ...props
}: {
  label: string;
  name: string;
  errors?: ValidationErrors;
  variant?: "labelled" | "accent";
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const fieldErrors = errors?.[name];
  const accent = variant === "accent";

  return (
    <label className="block">
      <span
        className={
          accent ? "sr-only" : "mb-2 block text-[20px] font-bold leading-tight text-ink"
        }
      >
        {label}
      </span>
      <input
        name={name}
        placeholder={props.placeholder ?? (accent ? label : undefined)}
        aria-invalid={fieldErrors ? true : undefined}
        aria-describedby={fieldErrors ? `${name}-error` : undefined}
        className={`h-[45px] w-full rounded-[10px] bg-[#f1f1f1] text-[18px] text-ink outline-none transition placeholder:text-ink/50 aria-[invalid]:border-2 aria-[invalid]:border-glow ${
          accent
            ? "border-l-[6px] border-navy px-3"
            : "border-2 border-transparent px-[18px] focus:border-navy"
        }`}
        {...props}
      />
      {hint && <span className="mt-1 block text-[14px] text-ink/80">{hint}</span>}
      {fieldErrors && (
        <span id={`${name}-error`} className="mt-1.5 block text-sm text-glow">
          {fieldErrors[0]}
        </span>
      )}
    </label>
  );
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-[10px] bg-navy px-4 py-2.5 text-[18px] font-bold tracking-[0.02em] text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  if (!children) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg px-3.5 py-2.5 text-sm ${
        tone === "error" ? "bg-glow/10 text-glow" : "bg-navy/5 text-navy"
      }`}
    >
      {children}
    </p>
  );
}
