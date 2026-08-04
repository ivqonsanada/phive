"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { applyAsIndividual, applyAsTeam } from "@/app/actions/apply";
import { FormMessage, SubmitButton } from "@/components/form";
import { Select } from "@/components/ui/select";
import { BOARD_LABELS } from "@/lib/board-labels";
import { Icon } from "@/lib/icons";
import type { ApplicantType, Expertise, Party } from "@/lib/types";

const ALL_EXPERTISE = Object.values(BOARD_LABELS);

/** `.form-group__input-name.form__input-name`: 18px/600, 24px on desktop. */
const LABEL = "mb-3 block text-[18px] font-semibold leading-[1.15] text-ink xl:text-[24px]";
const TEXTAREA =
  "w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] p-[15px] text-[14px] leading-[1.65] outline-none transition [font-family:inherit] focus:border-navy xl:text-[18px]";

export function ApplyForms({
  projectUrl,
  applicantType,
  lookingFor,
  party,
  tagname,
  defaultExpertise,
}: {
  projectUrl: string;
  applicantType: ApplicantType;
  lookingFor: Expertise[];
  party: Party | null;
  tagname: string;
  defaultExpertise: Expertise | null;
}) {
  const canIndividual = applicantType !== "Team";
  const canTeam = applicantType !== "Individual";

  const [mode, setMode] = useState<"individual" | "team">(canIndividual ? "individual" : "team");

  return (
    <div className="flex flex-col gap-5">
      {/* `.form-group__radio-container`: the applicant type as two wide outlined
          squares, the chosen one filled navy. */}
      <div className="mb-5">
        <h4 className={LABEL}>Applicant</h4>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(125px,1fr))] gap-2.5 xl:gap-[22px]">
          <TypeButton
            active={mode === "individual"}
            disabled={!canIndividual}
            onClick={() => setMode("individual")}
          >
            Individual
          </TypeButton>
          <TypeButton active={mode === "team"} disabled={!canTeam} onClick={() => setMode("team")}>
            Team
          </TypeButton>
        </div>
      </div>

      {mode === "individual" && canIndividual && (
        <IndividualForm
          projectUrl={projectUrl}
          lookingFor={lookingFor}
          tagname={tagname}
          defaultExpertise={defaultExpertise}
        />
      )}

      {mode === "team" && canTeam && (
        <TeamForm projectUrl={projectUrl} party={party} lookingFor={lookingFor} />
      )}
    </div>
  );
}

function IndividualForm({
  projectUrl,
  lookingFor,
  tagname,
  defaultExpertise,
}: {
  projectUrl: string;
  lookingFor: Expertise[];
  tagname: string;
  defaultExpertise: Expertise | null;
}) {
  const [state, action] = useActionState(applyAsIndividual.bind(null, projectUrl), undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div>
        <h4 className={LABEL}>Expertise Role</h4>
        <ExpertiseSelect
          name="expertise"
          lookingFor={lookingFor}
          defaultValue={defaultExpertise ?? ""}
          required
        />
        {state?.errors?.expertise && (
          <p className="mt-1.5 text-[14px] text-glow">{state.errors.expertise[0]}</p>
        )}
      </div>

      {/* Shown and disabled, as the original had it: you apply as yourself, and the
          field is here so you can see which account that is. */}
      <div className="mb-5">
        <h4 className={LABEL}>Tag Name</h4>
        <div className="flex flex-row-reverse items-center rounded-[10px] bg-[#f1f1f1] text-[14px] xl:text-[18px]">
          <input
            disabled
            value={tagname}
            className="w-full cursor-not-allowed rounded-r-[10px] border-none bg-[#f1f1f1] py-0 pl-0 pr-[18px] leading-[41px] text-ink/60"
          />
          <span className="flex h-[45px] items-center pl-[18px] pr-[5px] text-[16px] font-bold text-[#484848] xl:text-[20px]">
            <Icon icon="entypo:email" aria-hidden />
          </span>
        </div>
      </div>

      <hr className="my-[30px] border-[#b0aeae]" />

      <label className="block">
        <span className={LABEL}>Tell me about yourself!</span>
        <textarea name="self_describe" rows={5} placeholder="Max. 300 words" className={TEXTAREA} />
      </label>

      <label className="block">
        <span className={LABEL}>Why are you interested in joining this project?</span>
        <textarea name="apply_reason" rows={5} placeholder="Max. 300 words" className={TEXTAREA} />
      </label>

      <Submit />
    </form>
  );
}

function TeamForm({
  projectUrl,
  party,
  lookingFor,
}: {
  projectUrl: string;
  party: Party | null;
  lookingFor: Expertise[];
}) {
  const [state, action] = useActionState(applyAsTeam.bind(null, projectUrl), undefined);

  if (!party) {
    return (
      <p className="text-[12px] leading-[1.65] xl:text-[14px]">
        You need a party you lead before applying as a team. Start one on the{" "}
        <Link href="/party" className="font-bold text-navy hover:text-glow">
          party page
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div>
        <h4 className={LABEL}>Who is applying</h4>
        <p className="mb-4 text-[11px] font-light xl:text-[14px] xl:font-normal">
          Leave someone on &ldquo;Not applying&rdquo; to keep them out of this application.
        </p>

        <div className="flex flex-col gap-4">
          {party.members.map((member) => (
            <div
              key={member.user.uuid}
              className="flex flex-col gap-2 xl:flex-row xl:items-center xl:gap-5"
            >
              <span className="min-w-32 flex-1 text-[14px] font-bold xl:text-[18px]">
                {member.user.name}
              </span>
              <ExpertiseSelect
                name={`expertise[${member.user.uuid}]`}
                lookingFor={lookingFor}
                defaultValue={member.expertise ?? ""}
                includeNone
                className="xl:max-w-[300px]"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="my-[30px] border-[#b0aeae]" />

      <label className="block">
        <span className={LABEL}>Tell me about your team!</span>
        <textarea name="self_describe" rows={5} placeholder="Max. 300 words" className={TEXTAREA} />
      </label>

      <label className="block">
        <span className={LABEL}>Why is your team interested in joining this project?</span>
        <textarea name="apply_reason" rows={5} placeholder="Max. 300 words" className={TEXTAREA} />
      </label>

      <Submit />
    </form>
  );
}

/** `.apply__btn-submit`: a large button pushed to the right on desktop. */
function Submit() {
  return (
    <div className="xl:mt-[50px] xl:flex xl:justify-end">
      <SubmitButton width="w-full xl:w-[200px]">
        <span>Submit</span>
        <Icon icon="si-glyph:paper-plane" className="size-[1.2em]" aria-hidden />
      </SubmitButton>
    </div>
  );
}

function ExpertiseSelect({
  name,
  lookingFor,
  defaultValue,
  required,
  includeNone,
  className = "",
}: {
  name: string;
  lookingFor: Expertise[];
  defaultValue: string;
  required?: boolean;
  includeNone?: boolean;
  className?: string;
}) {
  // Roles the project actually wants come first, but the rest stay selectable so a
  // student is never blocked by a lecturer's narrow tick-boxes.
  const wanted = ALL_EXPERTISE.filter((item) => lookingFor.includes(item));
  const others = ALL_EXPERTISE.filter((item) => !lookingFor.includes(item));

  return (
    <Select name={name} defaultValue={defaultValue} required={required} className={className}>
      {includeNone && <option value="">Not applying</option>}
      {!includeNone && !defaultValue && <option value="">Choose one…</option>}

      {wanted.length > 0 && (
        <optgroup label="Wanted for this project">
          {wanted.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </optgroup>
      )}
      {others.length > 0 && (
        <optgroup label="Other">
          {others.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </optgroup>
      )}
    </Select>
  );
}

function TypeButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-block w-full rounded-[10px] border-[0.12rem] px-5 py-2.5 text-center text-[14px] font-bold leading-[1.65] transition disabled:cursor-not-allowed disabled:opacity-40 xl:h-[60px] xl:text-[24px] ${
        active
          ? "border-navy bg-navy text-white"
          : "border-[#020201] bg-white text-[#020201] hover:bg-mist"
      }`}
    >
      {children}
    </button>
  );
}
