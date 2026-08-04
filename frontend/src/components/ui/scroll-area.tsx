"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

/**
 * shadcn's ScrollArea, trimmed to what this project uses.
 *
 * Radix hides the platform scrollbar and renders its own, which is the point: macOS
 * overlay scrollbars vanish until you touch them, so a column that scrolls looks
 * identical to one that does not. A drawn thumb is always there to say otherwise.
 *
 * `type="auto"` shows the bar whenever the content overflows, rather than only on
 * hover — the affordance has to be visible before you interact with it.
 */
export function ScrollArea({
  className = "",
  viewportClassName = "",
  children,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportClassName?: string;
}) {
  return (
    <ScrollAreaPrimitive.Root
      type="auto"
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={`size-full rounded-[inherit] [&>div]:!block ${viewportClassName}`}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex touch-none select-none p-0.5 transition-colors duration-150 data-[orientation=vertical]:w-2.5"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-navy/25 transition-colors hover:bg-navy/40" />
      </ScrollAreaPrimitive.Scrollbar>

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
