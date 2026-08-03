"use client";

import { useActionState } from "react";

import { updateProfile } from "@/app/actions/settings";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { BOARD_LABELS } from "@/lib/board-labels";
import type { User } from "@/lib/types";

const LINK_FIELDS = ["github", "linkedin", "behance", "dribbble", "website"] as const;

export function ProfileForm({ user }: { user: User }) {
  const [state, action] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="space-y-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="first_name" defaultValue={user.first_name} errors={state?.errors} />
        <Field label="Last name" name="last_name" defaultValue={user.last_name} errors={state?.errors} />
      </div>

      <Field
        label="Handle"
        name="tagname"
        defaultValue={user.tagname}
        errors={state?.errors}
        // Matches the API rule so the browser catches obvious mistakes first.
        pattern="[a-z0-9_]{3,30}"
      />

      <Field
        label={user.role === "Lecturer" ? "Staff number" : "Student number"}
        name="identity_number"
        defaultValue={user.identity_number ?? ""}
        errors={state?.errors}
      />

      {user.role === "Student" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy">Expertise</span>
          <select
            name="expertise"
            defaultValue={user.expertise ?? ""}
            className="w-full rounded-lg border border-navy/15 px-3 py-2.5 outline-none focus:border-navy"
          >
            <option value="">Not set</option>
            {Object.values(BOARD_LABELS).map((expertise) => (
              <option key={expertise} value={expertise}>
                {expertise}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="University" name="university" defaultValue={user.university ?? ""} errors={state?.errors} />
        <Field label="Faculty" name="faculty" defaultValue={user.faculty ?? ""} errors={state?.errors} />
        <Field label="Major" name="major" defaultValue={user.major ?? ""} errors={state?.errors} />
        <Field label="Location" name="location" defaultValue={user.location ?? ""} errors={state?.errors} />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Biography</span>
        <textarea
          name="biography"
          rows={5}
          defaultValue={user.biography ?? ""}
          className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
      </label>

      {user.role === "Student" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_open_hired" defaultChecked={user.is_open_hired} />
          Show lecturers that I&apos;m open to being hired
        </label>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">
          Skills <span className="font-normal text-ink/50">— one per line</span>
        </span>
        <textarea
          name="skills"
          rows={4}
          defaultValue={(user.skills ?? []).join("\n")}
          className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
      </label>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-semibold text-navy">Links</legend>
        {LINK_FIELDS.map((name) => (
          <Field
            key={name}
            label={name[0].toUpperCase() + name.slice(1)}
            name={name}
            type="url"
            placeholder="https://"
            defaultValue={user.links[name] ?? ""}
            errors={state?.errors}
          />
        ))}
      </fieldset>

      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
