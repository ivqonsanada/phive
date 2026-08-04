import { useSyncExternalStore } from "react";

/**
 * Tracks whether anything on the page is currently showing fixtures.
 *
 * A module-level store rather than context because the fallback is decided deep inside
 * a query function, far from the component that has to display the banner, and
 * threading it back through every hook's return type would change the shape of data
 * every consumer reads.
 *
 * Server renders always report `false`: the store is per-process there, so letting it
 * carry state across requests would show one visitor a banner earned by another.
 */
let showingDemoData = false;
const listeners = new Set<() => void>();

export function markDemoData(): void {
  if (showingDemoData) {
    return;
  }

  showingDemoData = true;
  listeners.forEach((listener) => listener());
}

export function resetDemoData(): void {
  if (!showingDemoData) {
    return;
  }

  showingDemoData = false;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useIsDemoData(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => showingDemoData,
    () => false,
  );
}
