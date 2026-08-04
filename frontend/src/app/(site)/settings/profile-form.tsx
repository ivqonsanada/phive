"use client";

import { useActionState } from "react";

import { updateProfile } from "@/app/actions/settings";
import { Field, FormMessage, SubmitButton } from "@/components/form";
import { Select } from "@/components/ui/select";
import { BOARD_LABELS } from "@/lib/board-labels";
import { Icon } from "@/lib/icons";
import type { User } from "@/lib/types";

/** The original's social media block, icon beside field, in this order. */
const LINK_FIELDS = [
  { name: "behance", icon: "ant-design:behance-outlined", example: (n: string) => `behance.net/${n}` },
  { name: "github", icon: "ant-design:github-filled", example: (n: string) => `github.com/${n}` },
  { name: "linkedin", icon: "bx:bxl-linkedin", example: (n: string) => `linkedin.com/in/${n}` },
  { name: "dribbble", icon: "whh:dribbblealt", example: (n: string) => `dribbble.com/${n}` },
  { name: "website", icon: "whh:website", example: (n: string) => `${n}.github.io` },
] as const;

const LABEL = "mb-3 block text-[18px] font-semibold leading-[1.15] text-ink xl:text-[24px]";
const TEXTAREA =
  "w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] p-[15px] text-[14px] leading-[1.65] outline-none transition [font-family:inherit] focus:border-navy xl:text-[18px]";

export function ProfileForm({ user }: { user: User }) {
  const [state, action] = useActionState(updateProfile, undefined);
  const firstName = user.first_name.toLowerCase() || "yourname";

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}

      {/* `.form__input--group`: side by side from desktop, stacked before that. */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-5">
        <Field
          label="First Name"
          name="first_name"
          defaultValue={user.first_name}
          errors={state?.errors}
        />
        <Field
          label="Last Name"
          name="last_name"
          defaultValue={user.last_name}
          errors={state?.errors}
        />
      </div>

      {/* Disabled and never submitted: the original showed your status here so the ID
          field below could name itself, and it is not something you can change. */}
      <label className="block">
        <span className={LABEL}>Status</span>
        <input
          disabled
          value={user.role}
          className="h-[45px] w-full cursor-not-allowed rounded-[10px] border-none bg-[#f1f1f1] px-[18px] text-[14px] text-ink/60 xl:text-[18px]"
        />
      </label>

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

      {user.role === "Student" && (
        <label className="block">
          <span className={LABEL}>Expertise Role</span>
          <Select name="expertise" defaultValue={user.expertise ?? ""}>
            <option value="">Not set</option>
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
          className={TEXTAREA}
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
          className={TEXTAREA}
        />
      </label>

      {user.role === "Student" && (
        // `.edit__hire--container`
        <div className="grid grid-cols-[1.8fr_2fr] items-center gap-[25px] rounded-[10px] bg-[#f1f1f1] p-4 xl:px-7 xl:py-6">
          <span className="text-[14px] font-semibold xl:text-[18px]">Open to be hired</span>
          <label className="flex cursor-pointer items-center gap-2.5 justify-self-end text-[14px] xl:text-[18px]">
            {/* An unchecked box submits nothing, which the action cannot tell apart
                from a form that never offered the field. This makes the key always
                present; the checkbox adds "on" when ticked. */}
            <input type="hidden" name="is_open_hired" value="off" />
            <input
              type="checkbox"
              name="is_open_hired"
              defaultChecked={user.is_open_hired}
              className="size-5 accent-navy"
            />
            Show lecturers I&rsquo;m available
          </label>
        </div>
      )}

      <hr className="my-[30px] border-[#b0aeae]" />

      <div>
        <h2 className="mb-[30px] text-center text-[24px] font-extrabold xl:text-[48px]">
          Social Media
        </h2>

        <div className="flex flex-col gap-6">
          {LINK_FIELDS.map((link) => (
            <div key={link.name} className="flex flex-row items-center gap-5">
              <Icon
                icon={link.icon}
                className="size-[30px] shrink-0 text-navy xl:size-[45px]"
                aria-hidden
              />
              <input
                name={link.name}
                type="url"
                aria-label={link.name}
                placeholder={`e.g., ${link.example(firstName)}`}
                defaultValue={user.links[link.name] ?? ""}
                className="w-full rounded-[10px] border-2 border-transparent bg-[#f1f1f1] px-3 py-2.5 text-[14px] leading-[1.65] outline-none transition focus:border-navy xl:text-[18px]"
              />
            </div>
          ))}
        </div>
      </div>

      <hr className="my-[30px] border-[#b0aeae]" />

      {/* `.form-tag__group`: the field and its @ badge share one rounded box, and the
          focus ring is drawn across both halves so it reads as a single control. */}
      <div className="mb-5">
        <label htmlFor="tagname" className={LABEL}>
          Tag Name
        </label>
        <div className="flex flex-row-reverse items-center rounded-[10px] bg-[#f1f1f1] text-[14px] xl:text-[18px]">
          <input
            id="tagname"
            name="tagname"
            defaultValue={user.tagname}
            // Matches the API rule so the browser catches obvious mistakes first.
            pattern="[a-z0-9_]{3,30}"
            className="peer w-full rounded-r-[10px] border-y-2 border-r-2 border-transparent bg-[#f1f1f1] py-0 pl-0 pr-[18px] leading-[41px] outline-none focus:border-navy"
          />
          <label
            htmlFor="tagname"
            className="flex h-[45px] items-center rounded-l-[10px] border-y-2 border-l-2 border-transparent pl-[18px] pr-[5px] text-[16px] font-bold text-[#484848] peer-focus:border-navy xl:text-[20px]"
          >
            <Icon icon="entypo:email" aria-hidden />
          </label>
        </div>
        {state?.errors?.tagname && (
          <p className="mt-1.5 text-[14px] text-glow">{state.errors.tagname[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2.5 xl:flex-row xl:justify-end">
        <SubmitButton>Save Changes</SubmitButton>
      </div>
    </form>
  );
}
