import { afterEach, describe, expect, it, vi } from "vitest";

import { formatMoney, timeAgo } from "@/lib/format";

describe("formatMoney", () => {
  it("formats a rupiah amount the way the original app did", () => {
    expect(formatMoney("IDR", "1500000")).toBe("1.500.000,- IDR");
  });

  it("calls anything without a positive amount unpaid", () => {
    // The card shows this verbatim, so zero must not render as "0,- IDR".
    expect(formatMoney("IDR", "0")).toBe("Unpaid");
    expect(formatMoney("IDR", "")).toBe("Unpaid");
    expect(formatMoney("IDR", "not a number")).toBe("Unpaid");
    expect(formatMoney("IDR", "-100")).toBe("Unpaid");
  });

  it("keeps large values exact", () => {
    // Amounts arrive as strings precisely so big rupiah figures do not lose precision.
    expect(formatMoney("IDR", "9007199254740993")).toContain("9.007.199.254.740.99");
  });
});

describe("timeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("describes recent and older timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));

    expect(timeAgo("2026-06-15T11:59:30Z")).toMatch(/second/);
    expect(timeAgo("2026-06-15T10:00:00Z")).toMatch(/hour/);
    expect(timeAgo("2026-06-08T12:00:00Z")).toMatch(/week|day/);
    expect(timeAgo("2025-06-15T12:00:00Z")).toMatch(/year/);
  });

  it("stays in the past tense for a moment ago", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));

    expect(timeAgo("2026-06-15T12:00:00Z")).not.toContain("in ");
  });
});
