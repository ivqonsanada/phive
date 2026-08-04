"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Field, FormMessage } from "@/components/form";
import type { FormState, Project } from "@/lib/types";

const EXPERTISE_FIELDS = [
  { name: "ui_ux_designer", label: "UI/UX Designer" },
  { name: "front_end_engineer", label: "Frontend Engineer" },
  { name: "back_end_engineer", label: "Backend Engineer" },
  { name: "data_expert", label: "Data Expert" },
] as const;

export function ProjectForm({
  action,
  project,
}: {
  action: (state: FormState | undefined, formData: FormData) => Promise<FormState>;
  project?: Project;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <Field
        label="Title"
        name="title"
        defaultValue={project?.title ?? ""}
        errors={state?.errors}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Description</span>
        <textarea
          name="description"
          rows={8}
          defaultValue={project?.description ?? ""}
          className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
        {state?.errors?.description && (
          <span className="mt-1.5 block text-sm text-glow">{state.errors.description[0]}</span>
        )}
      </label>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-navy">Hiring for</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXPERTISE_FIELDS.map((field) => (
            <label key={field.name} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={field.name}
                defaultChecked={project?.looking_for.includes(field.label)}
              />
              {field.label}
            </label>
          ))}
        </div>
        {state?.errors?.ui_ux_designer && (
          <p className="mt-1.5 text-sm text-glow">{state.errors.ui_ux_designer[0]}</p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Accepts</span>
          <select
            name="applicant_type"
            defaultValue={project?.applicant_type ?? "Individual & Team"}
            className="w-full rounded-lg border border-navy/15 px-3 py-2.5 outline-none focus:border-navy"
          >
            <option>Individual &amp; Team</option>
            <option>Individual</option>
            <option>Team</option>
          </select>
        </label>

        <Field
          label="Team size"
          name="max_person"
          defaultValue={project?.max_person ?? ""}
          placeholder="Not Specified"
          errors={state?.errors}
        />
        <Field
          label="Level"
          name="level_applicant"
          defaultValue={project?.level_applicant ?? ""}
          placeholder="Beginner"
          errors={state?.errors}
        />
      </div>

      <fieldset className="rounded-xl border border-navy/10 p-4">
        <legend className="px-1 text-sm font-semibold text-navy">Reward</legend>

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="certificate" defaultChecked={project?.reward.certificate} />
          Certificate on completion
        </label>

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" name="salary" defaultChecked={project?.reward.salary} />
          This project pays
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field
            label="Currency"
            name="currency"
            defaultValue={project?.reward.currency ?? "IDR"}
            errors={state?.errors}
          />
          <Field
            label="Amount"
            name="salary_amount"
            type="number"
            min={0}
            defaultValue={project?.reward.amount ?? "0"}
            errors={state?.errors}
          />
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy">Per</span>
            <select
              name="payment_type"
              defaultValue={project?.reward.payment_type ?? "person"}
              className="w-full rounded-lg border border-navy/15 px-3 py-2.5 outline-none focus:border-navy"
            >
              <option value="person">Person</option>
              <option value="project">Project</option>
            </select>
          </label>
        </div>
      </fieldset>

      <TextareaList
        label="Skills"
        name="skills"
        hint="One per line"
        defaultValue={project?.skills?.join("\n") ?? ""}
      />
      <TextareaList
        label="Requirements"
        name="requirements"
        hint="One per line"
        defaultValue={project?.requirements?.join("\n") ?? ""}
      />

      <div className="flex flex-wrap gap-3">
        <IntentButton intent="draft" variant="secondary">
          Save draft
        </IntentButton>
        <IntentButton intent="publish" variant="primary">
          {project?.status === "Draft" || !project ? "Publish" : "Save changes"}
        </IntentButton>
      </div>
    </form>
  );
}

function TextareaList({
  label,
  name,
  hint,
  defaultValue,
}: {
  label: string;
  name: string;
  hint: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">
        {label} <span className="font-normal text-ink/50">— {hint}</span>
      </span>
      <textarea
        name={name}
        rows={4}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
      />
    </label>
  );
}

/**
 * Both buttons submit the same form; `intent` is what tells the action whether this
 * was a draft save or a publish.
 */
function IntentButton({
  intent,
  variant,
  children,
}: {
  intent: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending}
      className={
        variant === "primary"
          ? "rounded-lg bg-navy px-5 py-2.5 font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
          : "rounded-lg border border-navy/15 px-5 py-2.5 font-semibold text-navy transition hover:border-navy disabled:opacity-60"
      }
    >
      {children}
    </button>
  );
}
