"use client";

import Image from "next/image";
import { useRef } from "react";

import { placeholderCover } from "@/lib/placeholders";

/**
 * The project page's cover: the original's organic mask-image.png cut-out, which opens
 * the full, unmasked picture in a lightbox. A project without an upload gets its
 * placeholder cover, the same one its cards show.
 *
 * The lightbox is a native <dialog>, so Esc, focus trapping and returning focus to the
 * cover come from the browser. A click on the backdrop (the dialog element itself,
 * outside the picture) closes it too.
 */
export function ProjectCover({
  src,
  seed,
  title,
}: {
  src: string | null;
  seed: string;
  title: string | null;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cover = src ?? placeholderCover(seed);
  const full = src ?? placeholderCover(seed, 1360, 1000);
  const label = title ? `${title} cover` : "Project cover";

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label={`View ${label.toLowerCase()} full size`}
        className="mx-auto my-2 block h-[220px] w-full max-w-[510px] cursor-zoom-in bg-mist bg-cover bg-center sm:h-[260px] xl:h-[374px]"
        style={{
          // The second layer shows through if the cover URL is broken.
          backgroundImage: `url(${cover}), url(/images/img-placeholder.png)`,
          maskImage: "url(/images/mask-image.png)",
          maskSize: "100%",
          maskRepeat: "no-repeat",
          maskPosition: "center",
        }}
      />

      <dialog
        ref={dialog}
        aria-label={label}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        className="m-auto max-h-[92vh] max-w-[min(92vw,1100px)] overflow-visible bg-transparent p-0 backdrop:bg-deep/85"
      >
        <Image
          src={full}
          alt={label}
          width={1360}
          height={1000}
          unoptimized
          className="h-auto max-h-[86vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="mx-auto mt-4 block rounded-full bg-paper px-6 py-2 text-sm font-bold text-navy hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
        >
          Close
        </button>
      </dialog>
    </>
  );
}
