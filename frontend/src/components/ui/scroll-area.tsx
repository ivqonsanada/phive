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
      {/* Radix wraps the children in a display:table div and measures *that* to size
          and place the thumb. Forcing it to block — a common workaround for making
          flex children behave — breaks the measurement, so the thumb stops tracking
          the content. Leave it alone and let the content inside do the layout. */}
      <ScrollAreaPrimitive.Viewport className={`size-full rounded-[inherit] ${viewportClassName}`}>
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* data-[orientation=vertical]:h-full is load-bearing. Radix derives the thumb's
          travel from the scrollbar's height; without it the track measures short, so
          the thumb starts already displaced and stops moving about half way down. */}
      <ScrollAreaPrimitive.Scrollbar
        orientation="vertical"
        className="flex touch-none select-none p-px transition-colors select-none data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent"
      >
        <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-navy/25 transition-colors hover:bg-navy/40" />
      </ScrollAreaPrimitive.Scrollbar>

      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
