"use client";

import { useActionState } from "react";

import type {
  IndividualApplication,
  TeamApplication,
} from "@/app/(site)/my/projects/[projectUrl]/shortlist/page";
import { shortlistApplicants } from "@/app/actions/project-box";
import { FormMessage, SubmitButton } from "@/components/form";

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

  return (
    <form action={action} className="space-y-6">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      {individuals.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-navy">Individuals</h2>
          <ul className="space-y-3">
            {individuals.map((application) => (
              <li key={application.uuid} className="rounded-xl border border-navy/10 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="individual_uuids"
                    value={application.uuid}
                    defaultChecked={application.status !== "Applying"}
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">
                      {application.user.name}{" "}
                      <span className="font-normal text-ink/50">@{application.user.tagname}</span>
                    </span>
                    <span className="block text-sm text-ink/60">
                      Applying as {application.expertise} · {application.status}
                    </span>
                    {application.apply_reason && (
                      <span className="mt-2 block text-sm text-ink/70">
                        {application.apply_reason}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {teams.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-navy">Teams</h2>
          <ul className="space-y-3">
            {teams.map((application) => (
              <li key={application.uuid} className="rounded-xl border border-navy/10 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="team_uuids"
                    value={application.uuid}
                    defaultChecked={application.status !== "Applying"}
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-navy">
                      {application.leader.name}&apos;s team
                      <span className="font-normal text-ink/50"> · {application.status}</span>
                    </span>
                    <ul className="mt-1 space-y-0.5 text-sm text-ink/60">
                      {application.members.map((member) => (
                        <li key={member.user.uuid}>
                          {member.user.name} — {member.expertise ?? "No expertise"}
                        </li>
                      ))}
                    </ul>
                    {application.apply_reason && (
                      <span className="mt-2 block text-sm text-ink/70">
                        {application.apply_reason}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <SubmitButton>Shortlist selected</SubmitButton>
    </form>
  );
}
