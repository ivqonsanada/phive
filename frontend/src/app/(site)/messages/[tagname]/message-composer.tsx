"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendMessage } from "@/app/actions/messages";
import { FormMessage } from "@/components/form";

export function MessageComposer({ tagname }: { tagname: string }) {
  const [state, action, pending] = useActionState(sendMessage.bind(null, tagname), undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the box once the message is away, so the next one starts empty.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-auto space-y-2">
      {state?.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <div className="flex gap-2">
        <input
          name="message"
          placeholder="Write a message…"
          autoComplete="off"
          required
          className="min-w-0 flex-1 rounded-lg border border-navy/15 px-3.5 py-2.5 outline-none focus:border-navy"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-navy px-4 py-2.5 font-semibold text-white transition hover:bg-navy/90 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
    </form>
  );
}
