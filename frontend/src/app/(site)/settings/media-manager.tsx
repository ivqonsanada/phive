"use client";

import { useActionState } from "react";

import { removeMedia, uploadMedia } from "@/app/actions/settings";
import { Avatar } from "@/components/avatar";
import { FormMessage } from "@/components/form";
import type { User } from "@/lib/types";

export function MediaManager({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <MediaSlot
        field="avatar"
        label="Profile photo"
        accept="image/jpeg,image/png,image/webp"
        current={user.photo_url}
        preview={<Avatar src={user.photo_url} size={64} />}
      />

      <MediaSlot
        field="cv"
        label="CV (PDF)"
        accept="application/pdf"
        current={user.cv_url}
        preview={
          user.cv_url ? (
            <a
              href={user.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-navy hover:text-glow"
            >
              View current CV
            </a>
          ) : (
            <span className="text-sm text-ink/50">No CV uploaded</span>
          )
        }
      />
    </div>
  );
}

function MediaSlot({
  field,
  label,
  accept,
  current,
  preview,
}: {
  field: "avatar" | "cv";
  label: string;
  accept: string;
  current: string | null;
  preview: React.ReactNode;
}) {
  const [state, action, pending] = useActionState(uploadMedia.bind(null, field), undefined);

  return (
    <div className="rounded-xl border border-navy/10 p-4">
      <p className="mb-3 text-sm font-semibold text-navy">{label}</p>

      <div className="flex flex-wrap items-center gap-4">
        {preview}

        <form action={action} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="file"
            accept={accept}
            required
            className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-navy px-3.5 py-2 text-sm font-semibold text-white hover:bg-navy/90 disabled:opacity-60"
          >
            {pending ? "Uploading…" : "Upload"}
          </button>
        </form>

        {current && (
          <form action={removeMedia.bind(null, field)}>
            <button type="submit" className="text-sm font-semibold text-glow hover:underline">
              Remove
            </button>
          </form>
        )}
      </div>

      {state?.message && (
        <div className="mt-3">
          <FormMessage tone="error">{state.message}</FormMessage>
        </div>
      )}
      {state?.errors?.file && (
        <p className="mt-2 text-sm text-glow">{state.errors.file[0]}</p>
      )}
      {state?.success && (
        <div className="mt-3">
          <FormMessage tone="success">{state.success}</FormMessage>
        </div>
      )}
    </div>
  );
}
