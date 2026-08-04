"use client";

import { useActionState } from "react";

import type { Participant } from "@/app/(site)/my/projects/[projectUrl]/review/page";
import { submitReview } from "@/app/actions/project-box";
import { Avatar } from "@/components/avatar";
import { FormMessage, SubmitButton } from "@/components/form";
import { Select } from "@/components/ui/select";
import { BOARD_LABELS } from "@/lib/board-labels";
import { Icon } from "@/lib/icons";

const EXPERTISE_OPTIONS = Object.values(BOARD_LABELS);

const LABEL = "mb-3 block text-[18px] font-semibold leading-[1.15] text-ink xl:text-[24px]";
const INPUT =
  "h-[45px] w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] px-[18px] text-[14px] outline-none transition focus:border-navy xl:text-[18px]";
const TEXTAREA =
  "w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] p-[15px] text-[14px] leading-[1.65] outline-none transition [font-family:inherit] focus:border-navy xl:text-[18px]";

export function ReviewForm({
  projectUrl,
  participants,
}: {
  projectUrl: string;
  participants: Participant[];
}) {
  const [state, action] = useActionState(submitReview.bind(null, projectUrl), undefined);

  return (
    <form action={action}>
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      {/* `.review__overall--container`: label, a colon, then the field on one line. */}
      <div className="mb-[30px] flex flex-row items-center gap-2.5">
        <h4 className="my-0 max-w-[90px] text-right text-[24px] font-bold xl:w-full xl:max-w-none xl:text-[48px]">
          Overall Score
        </h4>
        <div className="ml-3 mr-5 text-[24px] font-bold">:</div>
        <div className="w-full">
          <input
            type="number"
            name="overall_score"
            min={0}
            max={5}
            step={0.1}
            placeholder="Scale is 0.0 - 5.0"
            required
            className={INPUT}
          />
        </div>
      </div>
      {state?.errors?.overall_score && (
        <p className="mb-4 text-[14px] text-glow">{state.errors.overall_score[0]}</p>
      )}

      <label className="mb-5 block">
        <span className={LABEL}>Overall Review</span>
        <textarea
          name="overall_review"
          rows={8}
          placeholder="Max. 500 words"
          className={TEXTAREA}
        />
      </label>

      <hr className="my-[30px] border-navy" />

      <div>
        <h4 className="text-[14px] font-bold xl:mb-[30px] xl:text-[24px]">Project Participants</h4>

        <div className="flex flex-col gap-[60px]">
          {participants.map((participant) => (
            // `.review-participant__left-container`: on desktop the person and their
            // score sit side by side with the assessment across the full width below;
            // on a phone the score drops under the assessment. Ordered with the grid
            // rather than rendered twice — the original used v-if, and two inputs of
            // the same name would both be submitted here, since `display: none` does
            // not exempt a field from a form.
            <div
              key={participant.member_uuid}
              className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-6"
            >
              <div className="order-1">
                <div className="mb-[15px] flex flex-row items-center gap-4">
                  <Avatar
                    src={participant.user.photo_url}
                    size={75}
                    sizeClassName="size-[65px] xl:size-[75px]"
                  />
                  <div className="flex flex-col justify-between xl:h-full">
                    <p className="text-[14px] leading-5 xl:text-[18px] xl:leading-[1.25]">
                      <b>Member</b>
                    </p>
                    <p className="text-[14px] leading-5 xl:text-[18px] xl:leading-[1.25]">
                      {participant.user.name}
                    </p>
                    <div className="mt-1">
                      <Select
                        name={`participants[${participant.member_uuid}][expertise]`}
                        defaultValue={participant.expertise ?? EXPERTISE_OPTIONS[0]}
                        aria-label={`Expertise for ${participant.user.name}`}
                        className="max-w-[240px]"
                      >
                        {EXPERTISE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

              </div>

              <label className="order-3 mb-[15px] block xl:order-2 xl:mb-6 xl:w-full xl:max-w-[400px]">
                <span className={LABEL}>Student Score</span>
                <input
                  type="number"
                  name={`participants[${participant.member_uuid}][score]`}
                  min={0}
                  max={5}
                  step={0.1}
                  defaultValue={participant.score ?? ""}
                  placeholder="Write down your student score"
                  required
                  className={INPUT}
                />
              </label>

              <label className="order-2 mb-[15px] block xl:order-3 xl:col-span-2">
                <span className={LABEL}>Assessment</span>
                <textarea
                  name={`participants[${participant.member_uuid}][assessment]`}
                  rows={5}
                  defaultValue={participant.assessment ?? ""}
                  placeholder="Write down your assessment"
                  className={TEXTAREA}
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      <hr className="my-[30px] border-navy" />

      <div className="mb-5">
        <h4 className={LABEL}>Project Result</h4>
        <div className="flex flex-row items-center gap-5">
          <Icon
            icon="whh:website"
            className="size-[30px] shrink-0 text-navy xl:size-[45px]"
            aria-hidden
          />
          <input
            name="project_result"
            type="url"
            aria-label="Project result URL"
            placeholder="e.g., project.github.io"
            className="w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] px-3 py-2.5 text-[14px] leading-[1.65] outline-none transition focus:border-navy xl:text-[18px]"
          />
        </div>
      </div>

      <div className="mt-[30px] flex justify-end">
        <SubmitButton width="w-full xl:w-[200px]">Post Review</SubmitButton>
      </div>
    </form>
  );
}
