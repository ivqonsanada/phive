"use client";

import { useActionState } from "react";

import { addExperience, removeExperience } from "@/app/actions/settings";
import { Thumbnail } from "@/components/avatar";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { btn } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import type { Experience } from "@/lib/types";

/**
 * The original's `.experience-item`: a thumbnail, the role and dates stacked beside it,
 * and a Delete button on the right.
 */
export function ExperienceManager({ experiences }: { experiences: Experience[] }) {
  const [state, action] = useActionState(addExperience, undefined);

  return (
    <div className="flex flex-col gap-6">
      {experiences.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {experiences.map((experience) => (
            <li
              key={experience.uuid}
              className="flex flex-row items-center justify-between gap-2.5"
            >
              <div className="flex min-w-0 flex-row items-center gap-2.5">
                <Thumbnail
                  src={null}
                  width={75}
                  height={75}
                  className="size-[50px] shrink-0 rounded-[5px] xl:size-[75px]"
                />
                <div className="flex min-w-0 flex-col gap-[5px] xl:gap-2.5">
                  <span className="truncate text-[11px] font-bold xl:text-[18px]">
                    {experience.project_name}
                  </span>
                  <span className="truncate text-[10px] xl:text-[14px]">
                    {experience.project_role}
                  </span>
                  <span className="text-[10px] text-[#757575] xl:text-[12px]">
                    {formatRange(experience)}
                  </span>
                </div>
              </div>

              <form action={removeExperience.bind(null, experience.uuid)}>
                <button
                  type="submit"
                  className={btn("decline", {
                    width: "w-auto",
                    extra: "h-[35px] px-3 text-[12px] xl:h-10 xl:px-6 xl:text-[14px]",
                  })}
                >
                  <Icon icon="ic:round-remove-circle-outline" className="size-4" aria-hidden />
                  Delete
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={action} className="flex flex-col gap-5">
        <div className="flex flex-row items-center gap-2">
          <Icon icon="ic:round-add-circle-outline" className="size-5" aria-hidden />
          <span className="text-[12px] font-extrabold uppercase xl:text-[16px]">
            Add an experience
          </span>
        </div>

        {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
        {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

        <Field label="Project" name="project_name" required errors={state?.errors} />
        <Field label="Your role" name="project_role" required errors={state?.errors} />

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Field label="Started" name="start_date" type="date" required errors={state?.errors} />
          <Field
            label="Ended"
            name="end_date"
            type="date"
            errors={state?.errors}
            hint="Leave blank if this is still ongoing"
          />
        </div>

        <div className="xl:flex xl:justify-end">
          <SubmitButton>Add experience</SubmitButton>
        </div>
      </form>
    </div>
  );
}

function formatRange(experience: Experience): string {
  const format = (value: string) =>
    new Date(value).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return `${format(experience.start_date)} — ${
    experience.end_date ? format(experience.end_date) : "now"
  }`;
}
