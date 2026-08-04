"use client";

import { useActionState } from "react";

import { inviteToParty } from "@/app/actions/party";
import { FormMessage } from "@/components/form";
import { btn } from "@/components/ui/button";

/**
 * The original had no invite control on this page — you invited people from their
 * profile, which meant you could not add anyone to your party without first finding
 * them. The field is kept, styled as the original's `.social-media__input`.
 */
export function InviteForm() {
  const [state, action, pending] = useActionState(inviteToParty, undefined);

  return (
    <form action={action} className="flex flex-col gap-2.5">
      <label htmlFor="party-invite" className="text-[14px] font-bold xl:text-[18px]">
        Invite by handle
      </label>

      <div className="flex gap-2.5">
        <input
          id="party-invite"
          name="tagname"
          placeholder="@handle"
          autoComplete="off"
          required
          className="w-full rounded-[10px] border-none bg-[#f1f1f1] px-3 py-2.5 text-[14px] leading-[1.65] outline-none focus:outline-2 focus:outline-navy xl:text-[18px]"
        />
        <button
          type="submit"
          disabled={pending}
          className={btn("blue", { size: "small", width: "w-[120px] shrink-0" })}
        >
          {pending ? "Sending…" : "Invite"}
        </button>
      </div>

      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}
    </form>
  );
}
