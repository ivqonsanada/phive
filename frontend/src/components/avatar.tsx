import Image from "next/image";

/**
 * Every avatar in the app, so the fallback is decided once.
 *
 * The placeholder is set two ways on purpose, which is how the original did it: as the
 * `src` when there is no photo, and as a CSS background underneath regardless. The
 * first covers a null value; the second covers a stored URL that 404s, which otherwise
 * renders the browser's broken-image glyph.
 */
export function Avatar({
  src,
  size,
  className = "",
  priority,
}: {
  src?: string | null;
  size: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || "/images/missing-avatar.svg"}
      alt=""
      width={size}
      height={size}
      priority={priority}
      unoptimized
      style={{ width: size, height: size }}
      className={`shrink-0 rounded-full bg-[url('/images/missing-avatar.svg')] bg-cover bg-center object-cover ${className}`}
    />
  );
}

/**
 * The same idea for project thumbnails, which fall back to the original's
 * img-placeholder.png rather than the avatar silhouette.
 */
export function Thumbnail({
  src,
  width,
  height,
  className = "",
  priority,
}: {
  src?: string | null;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src || "/images/img-placeholder.png"}
      alt=""
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={`bg-[url('/images/img-placeholder.png')] bg-cover bg-center object-cover ${className}`}
    />
  );
}
