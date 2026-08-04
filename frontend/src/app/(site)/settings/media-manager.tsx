"use client";

import { useActionState, useRef } from "react";

import { removeMedia, uploadMedia } from "@/app/actions/settings";
import { Avatar } from "@/components/avatar";
import { FormMessage } from "@/components/form";
import { btn } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import type { User } from "@/lib/types";

/**
 * The original's `.form-avatar-group__container`: the photo beside its two controls,
 * and the CV in the `.edit__cv--container` card below.
 *
 * The file input is hidden and driven by a label styled as a button, which is what the
 * original did — the browser's native file control cannot be styled and looks nothing
 * like the rest of the form.
 */
export function MediaManager({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-6">
      <MediaSlot
        field="avatar"
        accept="image/jpeg,image/png,image/webp"
        current={user.photo_url}
        hint="Max avatar size is 516KB"
        uploadLabel="Upload Photo"
        preview={
          <Avatar
            src={user.photo_url}
            size={125}
            className="mx-auto mb-[30px] block xl:mb-0 xl:ml-0"
          />
        }
        className="xl:flex xl:flex-row xl:items-center xl:gap-[50px]"
      />

      <MediaSlot
        field="cv"
        accept="application/pdf"
        current={user.cv_url}
        hint="PDF only"
        uploadLabel="Upload CV"
        preview={
          <div className="mb-4 flex flex-row items-center gap-2.5">
            <Icon icon="bx:bxs-file-pdf" className="size-6 xl:size-8" aria-hidden />
            {user.cv_url ? (
              <a
                href={user.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-bold text-navy hover:text-glow xl:text-[18px]"
              >
                Curriculum Vitae
              </a>
            ) : (
              <span className="text-[14px] font-bold text-ink/50 xl:text-[18px]">
                No CV uploaded
              </span>
            )}
          </div>
        }
        className="flex flex-col items-center rounded-[10px] bg-[#f1f1f1] p-4"
      />
    </div>
  );
}

function MediaSlot({
  field,
  accept,
  current,
  hint,
  uploadLabel,
  preview,
  className = "",
}: {
  field: "avatar" | "cv";
  accept: string;
  current: string | null;
  hint: string;
  uploadLabel: string;
  preview: React.ReactNode;
  className?: string;
}) {
  const [state, action, pending] = useActionState(uploadMedia.bind(null, field), undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className={className}>
      {preview}

      <div className="w-full">
        {/* `.form__file-container`: a 2:1 grid on a phone, a row on desktop. Two
            separate forms, because a form cannot be nested inside another. */}
        <div className="grid grid-cols-[2fr_1fr] gap-2.5 text-center xl:flex xl:gap-5">
          <form ref={formRef} action={action}>
            <label
              htmlFor={`${field}-file`}
              className={btn("blue", { extra: "cursor-pointer" })}
            >
              {pending ? "Uploading…" : uploadLabel}
            </label>
            {/* Submits as soon as a file is chosen: the original had a separate Upload
                press, which meant picking a file and then appearing to have done
                nothing. */}
            <input
              id={`${field}-file`}
              type="file"
              name="file"
              accept={accept}
              className="hidden"
              onChange={() => formRef.current?.requestSubmit()}
            />
          </form>

          {current && (
            <form action={removeMedia.bind(null, field)}>
              <button type="submit" className={btn("grey")}>
                Delete
              </button>
            </form>
          )}
        </div>

        <p className="ml-[3px] mt-[3px] text-[11px] font-light xl:ml-1.5 xl:mt-2.5 xl:text-[14px] xl:font-normal">
          {hint}
        </p>

        {state?.message && (
          <div className="mt-3">
            <FormMessage tone="error">{state.message}</FormMessage>
          </div>
        )}
        {state?.errors?.file && <p className="mt-2 text-[14px] text-glow">{state.errors.file[0]}</p>}
        {state?.success && (
          <div className="mt-3">
            <FormMessage tone="success">{state.success}</FormMessage>
          </div>
        )}
      </div>
    </div>
  );
}
