"use client";

import { useActionState } from "react";

import { inviteToParty } from "@/app/actions/party";
import { FormMessage } from "@/components/form";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteToParty, undefined);

  return (
    <form action={action} className="space-y-3 rounded-xl border border-navy/10 p-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-navy">Invite by handle</span>
        <div className="flex gap-2">
          <input
            name="tagname"
            placeholder="@handle"
            required
            className="min-w-0 flex-1 rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Invite"}
          </button>
        </div>
      </label>

      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {state?.success && <FormMessage tone="success">{state.success}</FormMessage>}
    </form>
  );
}
