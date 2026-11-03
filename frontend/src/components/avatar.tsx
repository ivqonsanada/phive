import Image from "next/image";

import { placeholderAvatar, placeholderCover } from "@/lib/placeholders";

/**
 * Every avatar in the app, so the fallback is decided once.
 *
 * With a `seed`, a missing photo becomes a placeholder face. Without one (upload
 * previews, empty slots) it stays the original's silhouette, so "no photo yet" still
 * reads as such. The silhouette is also the CSS background underneath regardless,
 * which covers a stored URL that 404s and would otherwise show the broken-image glyph.
 */
export function Avatar({
  src,
  seed,
  size,
  shape = "circle",
  sizeClassName,
  className = "",
  priority,
}: {
  src?: string | null;
  /** A stable id for the person (their uuid); picks the placeholder face. */
  seed?: string;
  /** Intrinsic size, in CSS pixels, at the largest the avatar is ever drawn. */
  size: number;
  /**
   * Tailwind sizing for avatars that change size across breakpoints. When given it
   * replaces the inline width/height, which would otherwise win over any class.
   */
  sizeClassName?: string;
  /**
   * The original used the same photo two ways: a circle everywhere a person is named,
   * and a 5px-radius square in the project box rows. A prop rather than a className
   * because two Tailwind radius utilities on one element resolve by stylesheet order,
   * not by which was passed last.
   */
  shape?: "circle" | "square";
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || (seed ? placeholderAvatar(seed) : "/images/missing-avatar.svg")}
      alt=""
      width={size}
      height={size}
      priority={priority}
      unoptimized
      style={sizeClassName ? undefined : { width: size, height: size }}
      className={`shrink-0 ${sizeClassName ?? ""} ${
        shape === "circle" ? "rounded-full" : "rounded-[5px]"
      } bg-[url('/images/missing-avatar.svg')] bg-cover bg-center object-cover ${className}`}
    />
  );
}

/**
 * The same idea for project thumbnails: a placeholder cover with a `seed`, otherwise
 * the original's img-placeholder.png.
 */
export function Thumbnail({
  src,
  seed,
  width,
  height,
  className = "",
  priority,
}: {
  src?: string | null;
  /** A stable id for the project (its uuid); picks the placeholder cover. */
  seed?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || (seed ? placeholderCover(seed) : "/images/img-placeholder.png")}
      alt=""
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={`bg-[url('/images/img-placeholder.png')] bg-cover bg-center object-cover ${className}`}
    />
  );
}
