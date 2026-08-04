import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api-error";
import { isBackendUnavailable, parseDemoMode, resolveWithFallback } from "@/lib/demo-mode";

describe("parseDemoMode", () => {
  it("defaults to auto when unset or unrecognised", () => {
    expect(parseDemoMode(undefined)).toBe("auto");
    expect(parseDemoMode("")).toBe("auto");
    expect(parseDemoMode("yes please")).toBe("auto");
  });

  it("accepts the spellings people actually type", () => {
    expect(parseDemoMode("always")).toBe("always");
    expect(parseDemoMode("true")).toBe("always");
    expect(parseDemoMode("1")).toBe("always");
    expect(parseDemoMode(" TRUE ")).toBe("always");

    expect(parseDemoMode("never")).toBe("never");
    expect(parseDemoMode("false")).toBe("never");
    expect(parseDemoMode("0")).toBe("never");
  });
});

describe("isBackendUnavailable", () => {
  it("treats a server fault as unavailable", () => {
    expect(isBackendUnavailable(new ApiError(500, "boom"))).toBe(true);
    expect(isBackendUnavailable(new ApiError(503, "maintenance"))).toBe(true);
  });

  it("does not treat a considered answer as unavailable", () => {
    // The backend replied. "No such project" is the truth, and swapping in a demo
    // project would turn a working 404 page into a fabricated one.
    expect(isBackendUnavailable(new ApiError(404, "Not found"))).toBe(false);
    expect(isBackendUnavailable(new ApiError(422, "Invalid"))).toBe(false);
  });

  it("treats a refusal on a public read as the wrong server answering", () => {
    // These endpoints are anonymous, so PHive itself cannot answer 401 or 403 to them.
    // A Worker deployed with API_URL still pointing at localhost resolves against the
    // public internet and gets exactly this from something that is not the API.
    expect(isBackendUnavailable(new ApiError(401, "Unauthenticated"))).toBe(true);
    expect(isBackendUnavailable(new ApiError(403, "Forbidden"))).toBe(true);
  });

  it("does not treat a cancelled request as unavailable", () => {
    expect(isBackendUnavailable(new DOMException("aborted", "AbortError"))).toBe(false);
  });

  it("treats a thrown fetch as unavailable", () => {
    expect(isBackendUnavailable(new TypeError("fetch failed"))).toBe(true);
  });
});

describe("resolveWithFallback", () => {
  const fixture = () => "demo" as const;

  it("returns live data when the API answers", async () => {
    const onFallback = vi.fn();

    await expect(
      resolveWithFallback({ mode: "auto", load: async () => "live", fixture, onFallback }),
    ).resolves.toBe("live");

    expect(onFallback).not.toHaveBeenCalled();
  });

  it("falls back when the backend is down", async () => {
    const onFallback = vi.fn();

    await expect(
      resolveWithFallback({
        mode: "auto",
        load: async () => {
          throw new TypeError("fetch failed");
        },
        fixture,
        onFallback,
      }),
    ).resolves.toBe("demo");

    expect(onFallback).toHaveBeenCalledOnce();
  });

  it("passes a 404 through rather than inventing a record", async () => {
    await expect(
      resolveWithFallback({
        mode: "auto",
        load: async () => {
          throw new ApiError(404, "Not found");
        },
        fixture,
      }),
    ).rejects.toThrow("Not found");
  });

  it("never calls the API when forced on", async () => {
    const load = vi.fn();

    await expect(resolveWithFallback({ mode: "always", load, fixture })).resolves.toBe("demo");
    expect(load).not.toHaveBeenCalled();
  });

  it("lets the failure through when forced off", async () => {
    await expect(
      resolveWithFallback({
        mode: "never",
        load: async () => {
          throw new TypeError("fetch failed");
        },
        fixture,
      }),
    ).rejects.toThrow("fetch failed");
  });
});
