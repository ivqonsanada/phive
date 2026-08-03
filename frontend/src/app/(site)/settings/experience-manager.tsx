"use client";

import { useActionState } from "react";

import { addExperience, removeExperience } from "@/app/actions/settings";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import type { Experience } from "@/lib/types";

export function ExperienceManager({ experiences }: { experiences: Experience[] }) {
  const [state, action] = useActionState(addExperience, undefined);

  return (
    <div className="space-y-5">
      {experiences.length > 0 && (
        <ul className="space-y-2">
          {experiences.map((experience) => (
            <li
              key={experience.id}
              className="flex items-center gap-3 rounded-xl border border-navy/10 p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-navy">{experience.project_name}</p>
                <p className="text-sm text-ink/60">
                  {experience.project_role} · {formatRange(experience)}
                </p>
              </div>

              <form action={removeExperience.bind(null, experience.id)}>
                <button type="submit" className="text-sm font-semibold text-glow hover:underline">
                  Remove
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="space-y-4 rounded-xl border border-navy/10 p-4">
        <p className="text-sm font-semibold text-navy">Add an experience</p>

        {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
        {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

        <Field label="Project" name="project_name" required errors={state?.errors} />
        <Field label="Your role" name="project_role" required errors={state?.errors} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Started" name="start_date" type="date" required errors={state?.errors} />
          <Field
            label="Ended"
            name="end_date"
            type="date"
            errors={state?.errors}
            // Left blank means it is still ongoing.
          />
        </div>

        <SubmitButton>Add experience</SubmitButton>
      </form>
    </div>
  );
}

function formatRange(experience: Experience): string {
  const format = (value: string) =>
    new Date(value).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return `${format(experience.start_date)} — ${
    experience.end_date ? format(experience.end_date) : "now"
  }`;
}
