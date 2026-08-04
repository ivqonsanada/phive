/**
 * The original's `.select`: a native <select> with the platform arrow removed and a
 * CSS-drawn chevron in its place, so the control looks the same on every OS.
 *
 * Native on purpose. The original was native, and a listbox rebuilt in JS would have to
 * re-earn keyboard behaviour, type-ahead and the mobile wheel picker that this gets for
 * nothing.
 */
export function Select({
  className = "",
  bordered = false,
  children,
  ...props
}: React.ComponentProps<"select"> & { bordered?: boolean }) {
  return (
    <div
      className={`relative grid cursor-pointer items-center rounded-[10px] text-[14px] xl:text-[18px] ${
        bordered ? "border border-[#b0aeae] bg-transparent" : "bg-[#f1f1f1]"
      } ${className}`}
    >
      {/* A native select does not inherit font-family, so it has to be asked to. */}
      <select
        {...props}
        className={`col-start-1 row-start-1 w-full cursor-pointer appearance-none bg-transparent py-0 pl-[18px] pr-10 [font-family:inherit] outline-none focus:outline-none ${
          bordered ? "leading-[40px]" : "leading-[45px]"
        }`}
      >
        {children}
      </select>

      {/* The chevron: a square with two borders, rotated. Same trick as the original. */}
      <span
        aria-hidden
        className="pointer-events-none col-start-1 row-start-1 mb-[1px] mr-[18px] size-[0.5em] justify-self-end rotate-45 border-b-2 border-r-2 border-[#b0aeae]"
      />
    </div>
  );
}
