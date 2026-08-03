"use client";

import { useFormStatus } from "react-dom";

import type { ValidationErrors } from "@/lib/types";

export function Field({
  label,
  name,
  errors,
  ...props
}: {
  label: string;
  name: string;
  errors?: ValidationErrors;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const fieldErrors = errors?.[name];

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <input
        name={name}
        aria-invalid={fieldErrors ? true : undefined}
        aria-describedby={fieldErrors ? `${name}-error` : undefined}
        className="w-full rounded-lg border border-navy/15 bg-white px-3.5 py-2.5 text-navy outline-none transition focus:border-navy focus:ring-2 focus:ring-navy/15 aria-[invalid]:border-glow aria-[invalid]:focus:ring-glow/20"
        {...props}
      />
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
      className="w-full rounded-lg bg-navy px-4 py-2.5 font-semibold text-white transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
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
