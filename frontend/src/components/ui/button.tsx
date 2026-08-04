/**
 * The original's `.btn` and its variants, as a class-string builder.
 *
 * A builder rather than a component because the original applied these classes to
 * whatever element the situation called for — `<button>`, `<a>`, and a `<router-link>`
 * rendered as a button. Here that means `<button>`, `<Link>` and form submits, and a
 * component wrapping only one of those would be worked around everywhere else.
 *
 * Nothing here merges conflicting utilities, so `extra` must not restate a property the
 * base already sets: two Tailwind classes for the same property resolve by stylesheet
 * order, not by which was passed last. Pass `width: false` and set your own instead.
 */
type Tone =
  | "blue"
  | "red"
  | "white"
  | "border"
  | "grey"
  | "grey2"
  | "green"
  | "decline"
  | "clear"
  | "link";

type Size = "default" | "small" | "large" | "chip";

const TONES: Record<Tone, string> = {
  blue: "bg-navy text-white hover:bg-navy/90",
  red: "bg-glow text-[#020201] hover:bg-glow/90",
  white: "border border-navy bg-white text-navy hover:bg-mist",
  border: "border border-navy bg-transparent text-navy hover:bg-mist",
  grey: "bg-[#f1f1f1] text-navy hover:bg-[#e6e6e6]",
  grey2: "bg-[#c6c5c5] text-[#020201] hover:bg-[#bcbbbb]",
  green: "bg-[#dcedc8] text-[#558b2f] hover:bg-[#d2e7b8]",
  decline: "bg-[#ffc7d1] text-[#c50000] hover:bg-[#ffb8c5]",
  clear: "bg-transparent text-inherit",
  link: "bg-transparent font-normal text-navy underline hover:text-glow",
};

const SIZES: Record<Size, string> = {
  default: "h-[45px] rounded-[10px] text-[18px]",
  small: "h-[40px] rounded-[10px] text-[14px]",
  large: "h-[60px] rounded-[15px] text-[18px]",
  // The original's .btn--accept / --cancel / --details: a fixed pill that sits inside a
  // row rather than spanning it.
  chip: "h-[30px] w-[90px] rounded-[5px] text-[14px] xl:h-[35px] xl:w-[120px] xl:text-[18px]",
};

export function btn(
  tone: Tone,
  {
    size = "default",
    width = true,
    extra = "",
  }: { size?: Size; width?: boolean | string; extra?: string } = {},
) {
  const base =
    "flex cursor-pointer select-none items-center justify-center gap-[5px] border-none font-bold tracking-[0.02em] no-underline transition disabled:cursor-not-allowed disabled:bg-[#f1f1f1] disabled:text-[#80807e]";

  // .btn is full-width on mobile and 20rem on desktop. `chip` carries its own.
  const widthClass =
    typeof width === "string" ? width : width && size !== "chip" ? "w-full xl:w-[200px]" : "";

  return [base, SIZES[size], TONES[tone], widthClass, extra].filter(Boolean).join(" ");
}

/** The original's `.btn--clear`: a button that is only its contents. */
export const btnClear =
  "cursor-pointer select-none border-none bg-transparent p-0 transition hover:opacity-80";
