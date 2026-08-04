"use client";

import { useFormStatus } from "react-dom";

import { btn } from "@/components/ui/button";
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
      {/* `.form-group__input-name`: 18px/600, and 24px on desktop. */}
      <span
        className={
          accent
            ? "sr-only"
            : "mb-3 block text-[18px] font-semibold leading-[1.15] text-ink xl:text-[24px]"
        }
      >
        {label}
      </span>
      <input
        name={name}
        placeholder={props.placeholder ?? (accent ? label : undefined)}
        aria-invalid={fieldErrors ? true : undefined}
        aria-describedby={fieldErrors ? `${name}-error` : undefined}
        className={`h-[45px] w-full rounded-[10px] bg-[#f1f1f1] text-ink outline-none transition placeholder:text-ink/50 aria-[invalid]:border-2 aria-[invalid]:border-glow ${
          accent
            ? "border-l-[6px] border-navy px-3 text-[18px]"
            : "border-2 border-transparent px-[18px] text-[14px] focus:border-navy xl:text-[18px]"
        }`}
        {...props}
      />
      {/* `.form-group__input-info`: the small print under a field. */}
      {hint && (
        <span className="ml-[3px] mt-[3px] block text-[11px] font-light text-ink/80 xl:ml-1.5 xl:mt-2.5 xl:text-[14px] xl:font-normal">
          {hint}
        </span>
      )}
      {fieldErrors && (
        <span id={`${name}-error`} className="mt-1.5 block text-sm text-glow">
          {fieldErrors[0]}
        </span>
      )}
    </label>
  );
}

export function SubmitButton({
  children,
  width,
}: {
  children: React.ReactNode;
  /** Overrides `.btn`'s default of full-width on mobile, 200px on desktop. */
  width?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={btn("blue", { width: width ?? true })}>
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
