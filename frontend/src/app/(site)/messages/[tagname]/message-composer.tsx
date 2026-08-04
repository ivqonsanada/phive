"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendMessage } from "@/app/actions/messages";
import { FormMessage } from "@/components/form";
import { btnClear } from "@/components/ui/button";
import { Icon } from "@/lib/icons";

/**
 * The original's `.chat-input__container`: pinned to the bottom of the viewport on a
 * phone, and part of the page — welded to the bottom of the message list — on desktop.
 *
 * The box grows with what you type, up to 136px, then scrolls.
 */
export function MessageComposer({ tagname }: { tagname: string }) {
  const [state, action, pending] = useActionState(sendMessage.bind(null, tagname), undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);

  // Clear the box once the message is away, so the next one starts empty.
  useEffect(() => {
    if (state?.success && boxRef.current) {
      formRef.current?.reset();
      boxRef.current.style.height = "";
    }
  }, [state]);

  function resize(box: HTMLTextAreaElement) {
    // Reset first: scrollHeight only reports the content's height when the element is
    // not already stretched to hold it.
    box.style.height = "auto";
    box.style.height = box.value ? `${Math.min(box.scrollHeight, 136)}px` : "";
  }

  return (
    <form
      ref={formRef}
      action={action}
      className="absolute bottom-0 left-0 flex w-full flex-wrap rounded-t-[20px] bg-white px-[18px] py-[15px] shadow-[0_-2px_5px_rgba(2,2,1,0.1)] xl:static xl:mx-auto xl:max-w-[1085px] xl:rounded-b-[10px] xl:rounded-t-none xl:border xl:border-t-0 xl:border-[#b0aeae] xl:shadow-none"
    >
      {/* basis-full so a failure pushes the box down rather than squeezing it. */}
      {state?.message && (
        <div className="mb-2 basis-full">
          <FormMessage tone="error">{state.message}</FormMessage>
        </div>
      )}

      <textarea
        ref={boxRef}
        name="message"
        rows={1}
        required
        placeholder="Type your message here"
        onInput={(event) => resize(event.currentTarget)}
        onKeyDown={(event) => {
          // Alt+Enter sends, as the original's "How to Chat" documents. A bare Enter
          // stays a newline, so a long message is not sent by accident half-written.
          if (event.altKey && event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        className="h-[32px] w-full resize-none rounded-[10px] border-none bg-[#cecccc] px-[15px] py-[5px] text-[12px] font-light [font-family:inherit] outline-none xl:h-[46px] xl:px-[30px] xl:py-2.5 xl:text-[18px] xl:font-normal"
      />

      <button
        type="submit"
        disabled={pending}
        aria-label="Send"
        className={`${btnClear} ml-2.5 flex self-end disabled:opacity-60`}
      >
        <Icon icon="carbon:send-filled" className="size-[30px] xl:size-10" aria-hidden />
      </button>
    </form>
  );
}
