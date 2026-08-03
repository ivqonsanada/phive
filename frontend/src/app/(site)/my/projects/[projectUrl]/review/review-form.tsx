"use client";

import { useActionState } from "react";

import type { Participant } from "@/app/(site)/my/projects/[projectUrl]/review/page";
import { submitReview } from "@/app/actions/project-box";
import { FormMessage, SubmitButton } from "@/components/form";
import { BOARD_LABELS } from "@/lib/board-labels";

const EXPERTISE_OPTIONS = Object.values(BOARD_LABELS);

export function ReviewForm({
  projectUrl,
  participants,
}: {
  projectUrl: string;
  participants: Participant[];
}) {
  const [state, action] = useActionState(submitReview.bind(null, projectUrl), undefined);

  return (
    <form action={action} className="space-y-6">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">
          Overall score (0–5)
        </span>
        <input
          type="number"
          name="overall_score"
          min={0}
          max={5}
          step={0.5}
          defaultValue={4}
          required
          className="w-32 rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
        {state?.errors?.overall_score && (
          <span className="mt-1.5 block text-sm text-glow">{state.errors.overall_score[0]}</span>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">How did it go?</span>
        <textarea
          name="overall_review"
          rows={4}
          className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">
          Result <span className="font-normal text-ink/50">— link or summary</span>
        </span>
        <input
          name="project_result"
          className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
      </label>

      <section>
        <h2 className="mb-3 font-semibold text-navy">Participants</h2>
        <ul className="space-y-4">
          {participants.map((participant) => (
            <li key={participant.member_uuid} className="rounded-xl border border-navy/10 p-4">
              <p className="mb-3 font-semibold text-navy">
                {participant.user.name}{" "}
                <span className="font-normal text-ink/50">@{participant.user.tagname}</span>
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-navy">Expertise</span>
                  <select
                    name={`participants[${participant.member_uuid}][expertise]`}
                    defaultValue={participant.expertise ?? EXPERTISE_OPTIONS[0]}
                    className="w-full rounded-lg border border-navy/15 px-3 py-2.5 outline-none focus:border-navy"
                  >
                    {EXPERTISE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-navy">Score (0–5)</span>
                  <input
                    type="number"
                    name={`participants[${participant.member_uuid}][score]`}
                    min={0}
                    max={5}
                    step={0.5}
                    defaultValue={participant.score ?? 4}
                    required
                    className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
                  />
                </label>
              </div>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-semibold text-navy">Assessment</span>
                <textarea
                  name={`participants[${participant.member_uuid}][assessment]`}
                  rows={2}
                  defaultValue={participant.assessment ?? ""}
                  className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <SubmitButton>Post review and finish project</SubmitButton>
    </form>
  );
}
