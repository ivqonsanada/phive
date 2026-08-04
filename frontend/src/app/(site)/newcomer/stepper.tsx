/**
 * The original's `.stepper`: three numbered circles joined by a rule, the ones you
 * have reached in black and the rest in grey.
 *
 * The circles are numbered with a CSS counter, as the original did, so the markup
 * carries only the labels.
 */
export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const labels = [
    "Biodata",
    <>
      Expertise
      <br />
      &amp;
      <br />
      Experience
    </>,
    "Get Ready!",
  ];

  return (
    <div className="mb-[30px] w-full [counter-reset:step]">
      <ol className="flex list-none flex-row pl-0">
        {labels.map((label, index) => {
          const reached = step > index;

          return (
            <li
              key={index}
              className={`relative w-1/3 text-center text-[14px] font-bold [counter-increment:step] xl:text-[24px] ${
                reached ? "text-[#020201]" : "text-[#c8c8c8]"
              }`}
            >
              {/* The joining rule. It sits behind the circles and the first step has
                  none, which is what makes the row read left to right. */}
              {index > 0 && (
                <span
                  aria-hidden
                  className="absolute left-[-50%] top-6 -z-10 h-[3px] w-full bg-[#ddd] xl:top-11"
                />
              )}

              <span
                aria-hidden
                className={`mx-auto mb-2.5 block size-9 rounded-full border-8 border-double bg-white text-center text-[28px] font-extrabold leading-[34px] [content:counter(step)] before:content-[counter(step)] xl:size-[72px] xl:text-[48px] xl:leading-[72px] ${
                  reached
                    ? "border-[#020201] text-[#020201]"
                    : "border-[#c8c8c8] text-[#c8c8c8]"
                }`}
              />

              {label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
