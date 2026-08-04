"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";

type EchoClient = InstanceType<typeof Echo>;

let client: EchoClient | null = null;

/**
 * A single Echo connection for the tab, created on first use.
 *
 * Returns null when Reverb is not configured, so realtime is additive: without it
 * the app still works, it just does not push.
 */
export function getEcho(): EchoClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;

  if (!key) {
    return null;
  }

  if (!client) {
    client = new Echo({
      broadcaster: "reverb",
      Pusher,
      key,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? window.location.hostname,
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
      enabledTransports: ["ws", "wss"],
      // Authorises against our own route, which holds the token server-side.
      authEndpoint: "/api/broadcasting/auth",
    });
  }

  return client;
}
