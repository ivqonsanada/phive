"use client";

import { useState } from "react";

import { btnClear } from "@/components/ui/button";
import { Modal, ModalSeparator, ModalTitle } from "@/components/ui/modal";
import { Icon } from "@/lib/icons";

/**
 * The original's "How to Chat" modal, behind the info button in the chat header. It is
 * the only place the message formatting rules are written down.
 */
export function ChatHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="How to chat"
        className={`${btnClear} flex`}
      >
        <Icon icon="eva:info-outline" className="size-[30px] xl:size-10" aria-hidden />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="small"
        title={<ModalTitle>How to Chat</ModalTitle>}
      >
        <ModalSeparator />

        <div className="space-y-2 text-[14px]">
          <p className="mb-5">Chat System is based on Markdown.</p>

          <Rule label="Enter (new line), do enter 2 times:">
            <Icon icon="uil:enter" className="size-5" aria-hidden />
            <Icon icon="uil:enter" className="size-5" aria-hidden />
          </Rule>
          <Rule
            label={
              <>
                <i>Italic</i>:
              </>
            }
          >
            *text* or _text_
          </Rule>
          <Rule
            label={
              <>
                <b>Bold</b>:
              </>
            }
          >
            **text**
          </Rule>
          <Rule
            label={
              <>
                <b>
                  <i>Italic Bold</i>
                </b>
                :
              </>
            }
          >
            ***text***
          </Rule>

          <div className="pt-5">
            <Rule label="Send Chat:">
              Alt + <Icon icon="uil:enter" className="size-5" aria-hidden />
            </Rule>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Rule({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-row items-center">
      <p>{label}</p>
      <div className="ml-2.5 flex items-center gap-1 rounded-[5px] bg-[#f1f1f1] px-2.5 py-[5px]">
        {children}
      </div>
    </div>
  );
}
