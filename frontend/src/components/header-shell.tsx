"use client";

import { useEffect, useState } from "react";

/**
 * The original's nav is `position: fixed` and starts with no background of its own and
 * no shadow, so at the top of the home page it reads as transparent against the hero's
 * #f2f4f6 band. Scrolling gives it a white background and the 2px shadow, which is what
 * separates it from the content passing underneath.
 *
 * Being fixed also means it does not push anything down — the site layout reserves the
 * 92px instead, and the home hero deliberately claims it back.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);

    // Run once on mount: a reload part-way down the page should start in the
    // scrolled state rather than waiting for the first scroll event.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-20 transition-[background-color,box-shadow] duration-200 ${
        scrolled ? "bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.1)]" : "bg-transparent"
      }`}
    >
      {children}
    </header>
  );
}
