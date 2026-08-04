/**
 * The original's `.project-box__container` and the row inside it.
 *
 * Every actionable item in the app — an inbox entry, a project in the project box — is
 * this shape: a square avatar or thumbnail on the left, the text in the middle, and the
 * buttons pushed to a third column on desktop that reflows underneath on mobile.
 */
export function ProjectBox({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col rounded-[10px] bg-mist px-[25px] py-[18px] ${className}`}>
      {children}
    </div>
  );
}

/** `.project-box__top-container`: the media / content / actions row. */
export function ProjectBoxRow({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-row gap-4 xl:gap-[26px]">{children}</div>;
}

/**
 * `.project-box__bottom-container`. On desktop the actions sit in the row and centre
 * themselves against it; on mobile they drop below with a margin above.
 */
export function ProjectBoxActions({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mt-[22px] xl:my-auto xl:ml-[25px] xl:mt-0 ${className}`}>{children}</div>
  );
}
