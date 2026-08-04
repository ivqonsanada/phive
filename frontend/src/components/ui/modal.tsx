"use client";

import { useEffect, useRef } from "react";

import { btnClear } from "@/components/ui/button";
import { Icon } from "@/lib/icons";

/**
 * The original's Modal: a white sheet 5rem from the top, over a 30%-black backdrop.
 *
 * Built on <dialog> rather than a positioned div, which is what the original used. The
 * element gives focus trapping, Escape-to-close, inertness of the page behind it and
 * the top layer for free — all things the original did not have, and none of which
 * change how it looks.
 */
export function Modal({
  open,
  onClose,
  title,
  size = "default",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  size?: "default" | "small" | "medium";
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const maxWidth = {
    default: "xl:max-w-[1080px]",
    small: "max-w-[480px]",
    medium: "max-w-[720px]",
  }[size];

  return (
    <dialog
      ref={ref}
      // `close` also fires for Escape and for the form-method=dialog path, so the
      // parent's state is kept in step however the dialog was dismissed.
      onClose={onClose}
      // A click that lands on the dialog element itself is a click on the backdrop:
      // the contents are in a child, so they never match.
      onClick={(event) => {
        if (event.target === ref.current) {
          onClose();
        }
      }}
      className={`m-auto w-[90%] rounded-[10px] bg-white p-0 text-ink backdrop:bg-black/30 ${maxWidth}`}
    >
      <div className="flex flex-col">
        <div className="flex items-end justify-between px-5 pb-2.5 pt-[34px]">
          {title}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`${btnClear} relative bottom-[15px] flex size-[30px] items-center justify-center text-[#9d9d9d]`}
          >
            <Icon icon="maki:cross-11" className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col items-stretch overflow-auto px-5 py-2.5">{children}</div>

        {footer && <div className="flex px-5 pb-[26px] pt-2.5">{footer}</div>}
      </div>
    </dialog>
  );
}

/** The original's `.post__modal--h4`, used as every modal's title. */
export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="my-0 text-[24px] font-semibold">{children}</h4>;
}

/** The original's `.separator-short`: a hairline rule under a modal's title. */
export function ModalSeparator() {
  return <hr className="mb-[15px] h-px border-none bg-navy" />;
}
