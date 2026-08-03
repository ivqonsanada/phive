"use client";

import { useActionState, useState } from "react";

import { applyAsIndividual, applyAsTeam } from "@/app/actions/apply";
import { FormMessage, SubmitButton } from "@/components/form";
import { BOARD_LABELS } from "@/lib/board-labels";
import type { ApplicantType, Expertise, Party } from "@/lib/types";

const ALL_EXPERTISE = Object.values(BOARD_LABELS);

export function ApplyForms({
  projectUrl,
  applicantType,
  lookingFor,
  party,
  defaultExpertise,
}: {
  projectUrl: string;
  applicantType: ApplicantType;
  lookingFor: Expertise[];
  party: Party | null;
  defaultExpertise: Expertise | null;
}) {
  const canIndividual = applicantType !== "Team";
  const canTeam = applicantType !== "Individual";

  const [mode, setMode] = useState<"individual" | "team">(
    canIndividual ? "individual" : "team",
  );

  return (
    <div className="space-y-6">
      {canIndividual && canTeam && (
        <div className="flex gap-2">
          <ModeButton active={mode === "individual"} onClick={() => setMode("individual")}>
            On my own
          </ModeButton>
          <ModeButton active={mode === "team"} onClick={() => setMode("team")}>
            With my party
          </ModeButton>
        </div>
      )}

      {mode === "individual" && canIndividual && (
        <IndividualForm
          projectUrl={projectUrl}
          lookingFor={lookingFor}
          defaultExpertise={defaultExpertise}
        />
      )}

      {mode === "team" && canTeam && <TeamForm projectUrl={projectUrl} party={party} lookingFor={lookingFor} />}
    </div>
  );
}

function IndividualForm({
  projectUrl,
  lookingFor,
  defaultExpertise,
}: {
  projectUrl: string;
  lookingFor: Expertise[];
  defaultExpertise: Expertise | null;
}) {
  const [state, action] = useActionState(applyAsIndividual.bind(null, projectUrl), undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <ExpertiseSelect
        name="expertise"
        label="Applying as"
        lookingFor={lookingFor}
        defaultValue={defaultExpertise ?? ""}
        required
      />
      {state?.errors?.expertise && (
        <p className="text-sm text-glow">{state.errors.expertise[0]}</p>
      )}

      <Textarea label="About you" name="self_describe" />
      <Textarea label="Why this project?" name="apply_reason" />

      <SubmitButton>Send application</SubmitButton>
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
      <p className="rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-ink/60">
        You need a party you lead before applying as a team. Start one on the{" "}
        <a href="/party" className="font-semibold text-navy hover:text-glow">
          party page
        </a>
        .
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <fieldset className="rounded-xl border border-navy/10 p-4">
        <legend className="px-1 text-sm font-semibold text-navy">Who is applying</legend>
        <p className="mb-3 text-xs text-ink/60">
          Leave someone on &ldquo;Not applying&rdquo; to keep them out of this application.
        </p>

        <div className="space-y-3">
          {party.members.map((member) => (
            <div key={member.user.uuid} className="flex flex-wrap items-center gap-3">
              <span className="min-w-32 flex-1 text-sm text-navy">{member.user.name}</span>
              <ExpertiseSelect
                name={`expertise[${member.user.uuid}]`}
                label=""
                lookingFor={lookingFor}
                defaultValue={member.expertise ?? ""}
                includeNone
              />
            </div>
          ))}
        </div>
      </fieldset>

      <Textarea label="About the team" name="self_describe" />
      <Textarea label="Why this project?" name="apply_reason" />

      <SubmitButton>Send team application</SubmitButton>
    </form>
  );
}

function ExpertiseSelect({
  name,
  label,
  lookingFor,
  defaultValue,
  required,
  includeNone,
}: {
  name: string;
  label: string;
  lookingFor: Expertise[];
  defaultValue: string;
  required?: boolean;
  includeNone?: boolean;
}) {
  // Roles the project actually wants come first, but the rest stay selectable so a
  // student is never blocked by a lecturer's narrow tick-boxes.
  const wanted = ALL_EXPERTISE.filter((item) => lookingFor.includes(item));
  const others = ALL_EXPERTISE.filter((item) => !lookingFor.includes(item));

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>}
      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-navy/15 px-3 py-2.5 outline-none focus:border-navy"
      >
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
      </select>
    </label>
  );
}

function Textarea({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-navy">{label}</span>
      <textarea
        name={name}
        rows={4}
        className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
      />
    </label>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-navy text-white" : "border border-navy/15 text-navy hover:border-navy"
      }`}
    >
      {children}
    </button>
  );
}
