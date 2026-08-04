"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";

import { updateProfile } from "@/app/actions/settings";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { Select } from "@/components/ui/select";
import { BOARD_LABELS } from "@/lib/board-labels";
import type { User } from "@/lib/types";

const LABEL = "mb-3 block text-[18px] font-semibold leading-[1.15] text-ink xl:text-[24px]";

/**
 * Steps one and two of the newcomer flow. Both save through the same profile endpoint
 * the settings page uses — the endpoint is a partial update, so each step sends only
 * the fields it renders and leaves the rest alone.
 *
 * Saving advances. The original made you press Save and then Next separately, which
 * meant a step could be filled in, left unsaved, and lost by pressing Next.
 */
function useAdvance(next: string) {
  const [state, action] = useActionState(updateProfile, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push(next);
    }
  }, [state, router, next]);

  return [state, action] as const;
}

export function BiodataStep({ user }: { user: User }) {
  const [state, action] = useAdvance("/newcomer/2");

  return (
    <form action={action} className="flex flex-col gap-5">
      <h2 className="mb-[30px] text-center text-[24px] font-extrabold xl:text-[48px]">
        Personal Information
      </h2>

      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Field
          label="First Name"
          name="first_name"
          defaultValue={user.first_name}
          required
          errors={state?.errors}
        />
        <Field
          label="Last Name"
          name="last_name"
          defaultValue={user.last_name}
          required
          errors={state?.errors}
        />
      </div>

      {/* Shown so the next label makes sense, and not submitted — your role is fixed
          at registration. */}
      <label className="block">
        <span className={LABEL}>Status</span>
        <input
          disabled
          value={user.role}
          className="h-[45px] w-full cursor-not-allowed rounded-[10px] border-none bg-[#f1f1f1] px-[18px] text-[14px] text-ink/60 xl:text-[18px]"
        />
      </label>

      {/* The handle is not editable here, but the endpoint requires it whenever a name
          is sent, so it rides along unchanged. */}
      <input type="hidden" name="tagname" value={user.tagname} />

      <Field
        label={`${user.role} ID Number`}
        name="identity_number"
        placeholder="e.g., 205150200111042"
        defaultValue={user.identity_number ?? ""}
        errors={state?.errors}
      />
      <Field
        label="University"
        name="university"
        placeholder="e.g., University of Brawijaya"
        defaultValue={user.university ?? ""}
        errors={state?.errors}
      />
      <Field
        label="Faculty"
        name="faculty"
        placeholder="e.g., Faculty of Computer Science"
        defaultValue={user.faculty ?? ""}
        errors={state?.errors}
      />
      <Field
        label="Major"
        name="major"
        placeholder="e.g., Informatics Engineering"
        defaultValue={user.major ?? ""}
        errors={state?.errors}
      />
      <Field
        label="Location"
        name="location"
        placeholder="e.g., Malang, Indonesia"
        defaultValue={user.location ?? ""}
        errors={state?.errors}
      />

      <div className="mt-5 xl:flex xl:justify-end">
        <SubmitButton>Save and Continue</SubmitButton>
      </div>
    </form>
  );
}

export function ExpertiseStep({ user }: { user: User }) {
  const [state, action] = useAdvance("/newcomer/3");

  return (
    <form action={action} className="flex flex-col gap-5">
      <h2 className="mb-[30px] text-center text-[24px] font-extrabold xl:text-[48px]">
        Expertise &amp; Experience
      </h2>

      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      {user.role === "Student" && (
        <label className="block">
          <span className={LABEL}>Expertise Role</span>
          <Select name="expertise" defaultValue={user.expertise ?? ""}>
            <option value="">Choose one…</option>
            {Object.values(BOARD_LABELS).map((expertise) => (
              <option key={expertise} value={expertise}>
                {expertise}
              </option>
            ))}
          </Select>
        </label>
      )}

      <label className="block">
        <span className={LABEL}>Biography</span>
        <textarea
          name="biography"
          rows={5}
          placeholder="Max. 300 words"
          defaultValue={user.biography ?? ""}
          className="w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] p-[15px] text-[14px] leading-[1.65] outline-none transition [font-family:inherit] focus:border-navy xl:text-[18px]"
        />
      </label>

      <label className="block">
        <span className={LABEL}>
          Skills <span className="text-[14px] font-normal text-ink/50">— one per line</span>
        </span>
        <textarea
          name="skills"
          rows={4}
          defaultValue={(user.skills ?? []).join("\n")}
          className="w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] p-[15px] text-[14px] leading-[1.65] outline-none transition [font-family:inherit] focus:border-navy xl:text-[18px]"
        />
      </label>

      {user.role === "Student" && (
        // `.newcomer__hire--container`
        <div className="mb-[50px] grid grid-cols-[1.8fr_2fr] items-center gap-[25px] rounded-[10px] bg-[#f1f1f1] p-4">
          <span className="text-[16px] font-semibold">Open to be hired</span>
          <label className="flex cursor-pointer items-center gap-2.5 justify-self-end text-[14px] xl:text-[18px]">
            <input type="hidden" name="is_open_hired" value="off" />
            <input
              type="checkbox"
              name="is_open_hired"
              defaultChecked={user.is_open_hired}
              className="size-5 accent-navy"
            />
            Yes
          </label>
        </div>
      )}

      <p className="text-[11px] font-light xl:text-[14px] xl:font-normal">
        You can add past projects any time from Settings.
      </p>

      <div className="mt-5 xl:flex xl:justify-end">
        <SubmitButton>Save and Continue</SubmitButton>
      </div>
    </form>
  );
}
