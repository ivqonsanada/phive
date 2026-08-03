"use client";

import { useOptimistic, useTransition } from "react";

import { toggleWishlist } from "@/app/actions/wishlist";

export function WishlistButton({
  projectUrl,
  initial,
}: {
  projectUrl: string;
  initial: boolean;
}) {
  const [isWished, setOptimistic] = useOptimistic(initial);
  const [, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={isWished}
      aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
      onClick={() =>
        startTransition(async () => {
          setOptimistic(!isWished);
          await toggleWishlist(projectUrl);
        })
      }
      className={`shrink-0 text-lg leading-none transition ${
        isWished ? "text-glow" : "text-navy/25 hover:text-navy/50"
      }`}
    >
      {isWished ? "★" : "☆"}
    </button>
  );
}
