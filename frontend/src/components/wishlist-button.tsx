"use client";

import { useOptimistic, useTransition } from "react";

import { toggleWishlist } from "@/app/actions/wishlist";
import { Icon } from "@/lib/icons";

/**
 * Two shapes, as the original had: a star on a project card, and a full outlined
 * button beside Apply on the detail page.
 */
export function WishlistButton({
  projectUrl,
  initial,
  variant = "icon",
}: {
  projectUrl: string;
  initial: boolean;
  variant?: "icon" | "button";
}) {
  const [isWished, setOptimistic] = useOptimistic(initial);
  const [, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      setOptimistic(!isWished);
      await toggleWishlist(projectUrl);
    });

  if (variant === "button") {
    return (
      <button
        type="button"
        aria-pressed={isWished}
        onClick={toggle}
        className={`flex h-[60px] w-full items-center justify-center gap-2 rounded-[10px] border-2 text-[18px] font-bold transition sm:w-[280px] ${
          isWished
            ? "border-glow bg-glow/10 text-glow"
            : "border-navy bg-white text-navy hover:bg-mist"
        }`}
      >
        <Icon
          icon={isWished ? "ic:round-check-circle" : "ic:round-add-circle"}
          className="size-6"
          aria-hidden
        />
        Wishlist
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isWished}
      aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
      onClick={toggle}
      className={`shrink-0 text-lg leading-none transition ${
        isWished ? "text-glow" : "text-navy/25 hover:text-navy/50"
      }`}
    >
      {isWished ? "★" : "☆"}
    </button>
  );
}
