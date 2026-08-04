"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import type {
  IndividualApplication,
  TeamApplication,
} from "@/app/(site)/my/projects/[projectUrl]/shortlist/page";
import { shortlistApplicants } from "@/app/actions/project-box";
import { Avatar } from "@/components/avatar";
import { FormMessage, SubmitButton } from "@/components/form";
import { btn } from "@/components/ui/button";
import { Modal, ModalSeparator, ModalTitle } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";

/**
 * The original's shortlist: a scrolling list of applicants, each with an Accept button
 * that flips to a green "Accepted", a Details modal behind an underlined link, and a
 * Proceed button that commits the lot.
 *
 * The chosen set is React state and rides along as hidden inputs, rather than the
 * checkboxes a form would reach for by default. That is what makes the row's own button
 * the toggle, which is the interaction the original had.
 */
export function ShortlistForm({
  projectUrl,
  individuals,
  teams,
}: {
  projectUrl: string;
  individuals: IndividualApplication[];
  teams: TeamApplication[];
}) {
  const [state, action] = useActionState(shortlistApplicants.bind(null, projectUrl), undefined);
  const [tab, setTab] = useState<"Individual" | "Team">("Individual");

  // Anything already past "Applying" has been shortlisted before, so it starts selected.
  const [chosen, setChosen] = useState<Set<string>>(
    () =>
      new Set(
        [...individuals, ...teams]
          .filter((application) => application.status !== "Applying")
          .map((application) => application.uuid),
      ),
  );

  const toggle = (uuid: string) =>
    setChosen((current) => {
      const next = new Set(current);

      if (next.has(uuid)) {
        next.delete(uuid);
      } else {
        next.add(uuid);
      }

      return next;
    });

  return (
    <form action={action}>
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      {/* Both tabs' selections are submitted, not just the visible one — switching tabs
          must not silently drop a choice. */}
      {individuals
        .filter((application) => chosen.has(application.uuid))
        .map((application) => (
          <input
            key={application.uuid}
            type="hidden"
            name="individual_uuids"
            value={application.uuid}
          />
        ))}
      {teams
        .filter((application) => chosen.has(application.uuid))
        .map((application) => (
          <input key={application.uuid} type="hidden" name="team_uuids" value={application.uuid} />
        ))}

      <div className="my-[15px]">
        <Select
          className="ml-auto w-full xl:max-w-[200px]"
          aria-label="Applicant type"
          value={tab}
          onChange={(event) => setTab(event.target.value as "Individual" | "Team")}
        >
          <option value="Individual">Individual</option>
          <option value="Team">Team</option>
        </Select>
      </div>

      <hr className="mb-2.5 hidden border-navy xl:block" />

      {/* `.shortlist-container`: scrolls on a phone, and becomes a two-column grid of
          440px cards on desktop. */}
      <div className="mb-[30px] flex h-[max(385px,30vh)] flex-col gap-[15px] overflow-y-scroll xl:grid xl:h-auto xl:max-h-[380px] xl:grid-cols-[repeat(auto-fill,440px)] xl:justify-between xl:overflow-y-auto">
        {tab === "Individual"
          ? individuals.map((application) => (
              <IndividualRow
                key={application.uuid}
                application={application}
                accepted={chosen.has(application.uuid)}
                onToggle={() => toggle(application.uuid)}
              />
            ))
          : teams.map((application) => (
              <TeamRow
                key={application.uuid}
                application={application}
                accepted={chosen.has(application.uuid)}
                onToggle={() => toggle(application.uuid)}
              />
            ))}

        {(tab === "Individual" ? individuals : teams).length === 0 && (
          <p className="text-[12px] leading-[1.65] xl:text-[14px]">
            No {tab} Applicants yet
          </p>
        )}
      </div>

      <hr className="mb-2.5 hidden border-navy xl:block" />

      <div className="flex justify-center">
        <SubmitButton width="w-full xl:w-[200px]">Proceed</SubmitButton>
      </div>
    </form>
  );
}

function IndividualRow({
  application,
  accepted,
  onToggle,
}: {
  application: IndividualApplication;
  accepted: boolean;
  onToggle: () => void;
}) {
  return (
    <Row
      user={application.user}
      subtitle={application.expertise}
      accepted={accepted}
      onToggle={onToggle}
      details={
        <>
          <Detail heading="About them">{application.self_describe}</Detail>
          <Detail heading="Why this project">{application.apply_reason}</Detail>
        </>
      }
    />
  );
}

function TeamRow({
  application,
  accepted,
  onToggle,
}: {
  application: TeamApplication;
  accepted: boolean;
  onToggle: () => void;
}) {
  return (
    <Row
      user={application.leader}
      subtitle={`${application.members.length} member team`}
      accepted={accepted}
      onToggle={onToggle}
      details={
        <>
          <div className="mb-5">
            <h5 className="mb-2 text-[20px] font-semibold">Members</h5>
            <ul className="flex flex-col gap-2">
              {application.members.map((member) => (
                <li key={member.user.uuid} className="flex flex-row items-center gap-3">
                  <Avatar src={member.user.photo_url} size={45} />
                  <span className="text-[18px] font-bold">{member.user.name}</span>
                  <span className="text-[18px] font-semibold text-ink/60">
                    {member.expertise ?? "No expertise"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Detail heading="About the team">{application.self_describe}</Detail>
          <Detail heading="Why this project">{application.apply_reason}</Detail>
        </>
      }
    />
  );
}

function Row({
  user,
  subtitle,
  accepted,
  onToggle,
  details,
}: {
  user: { name: string; tagname: string; photo_url: string | null };
  subtitle: string;
  accepted: boolean;
  onToggle: () => void;
  details: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between">
      <div className="flex flex-row gap-[15px] xl:items-center">
        <Link href={`/u/${user.tagname}`}>
          <Avatar
            src={user.photo_url}
            size={75}
            sizeClassName="size-[65px] xl:size-[75px]"
          />
        </Link>

        <div className="flex h-[75px] flex-col justify-around leading-[1.15]">
          <div>
            <div className="text-[12px] font-bold sm:text-[14px] xl:text-[18px]">{user.name}</div>
            <div className="text-[12px] font-semibold sm:text-[14px] xl:text-[18px]">
              {subtitle}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-fit cursor-pointer select-none border-none bg-transparent p-0 text-[12px] font-bold leading-[14px] underline xl:text-[18px]"
          >
            Details
          </button>
        </div>
      </div>

      {/* type="button" everywhere in here: this row lives inside the Proceed form, and
          a bare <button> would submit it. */}
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={accepted}
        className={btn(accepted ? "green" : "blue", { size: "chip" })}
      >
        {accepted ? "Accepted" : "Accept"}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="medium"
        title={<ModalTitle>Details</ModalTitle>}
      >
        <ModalSeparator />
        {details}
      </Modal>
    </div>
  );
}

function Detail({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h5 className="mb-2 text-[20px] font-semibold">{heading}</h5>
      <p className="text-[14px] leading-[1.65]">{children || "Nothing written."}</p>
    </div>
  );
}
