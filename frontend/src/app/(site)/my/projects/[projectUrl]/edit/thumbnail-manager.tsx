"use client";

import Image from "next/image";
import { useActionState } from "react";

import { removeThumbnail, uploadThumbnail } from "@/app/actions/manage-projects";
import { FormMessage } from "@/components/form";

export function ThumbnailManager({
  projectUrl,
  current,
}: {
  projectUrl: string;
  current: string | null;
}) {
  const [state, action, pending] = useActionState(
    uploadThumbnail.bind(null, projectUrl),
    undefined,
  );

  return (
    <div className="mb-8 rounded-xl border border-navy/10 p-4">
      <p className="mb-3 text-sm font-semibold text-navy">Thumbnail</p>

      <div className="flex flex-wrap items-center gap-4">
        {current ? (
          <Image
            src={current}
            alt=""
            width={128}
            height={80}
            className="h-20 w-32 rounded-lg object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-20 w-32 place-items-center rounded-lg bg-navy/10 text-sm text-navy/50">
            None
          </div>
        )}

        <form action={action} className="flex flex-wrap items-center gap-2">
          <input
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp"
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
          <form action={removeThumbnail.bind(null, projectUrl)}>
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
      {state?.errors?.file && <p className="mt-2 text-sm text-glow">{state.errors.file[0]}</p>}
      {state?.success && (
        <div className="mt-3">
          <FormMessage tone="success">{state.success}</FormMessage>
        </div>
      )}
    </div>
  );
}
