import { NextResponse } from "next/server";

import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

/**
 * Private-channel authorisation, proxied.
 *
 * Echo runs in the browser, but the Sanctum token lives in an httpOnly cookie the
 * browser cannot read. So the browser asks this route, and the route asks Laravel
 * with the bearer token attached — the token never leaves the server.
 *
 * Laravel serves this endpoint at /broadcasting/auth, outside the /api prefix, so it
 * is fetched directly rather than through the shared API client.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const token = await getToken();

  if (!token) {
    return NextResponse.json({ message: "Unauthenticated." }, { status: 401 });
  }

  const form = await request.formData();
  const socketId = form.get("socket_id");
  const channelName = form.get("channel_name");

  if (typeof socketId !== "string" || typeof channelName !== "string") {
    return NextResponse.json({ message: "Missing channel details." }, { status: 422 });
  }

  const response = await fetch(`${API_URL}/broadcasting/auth`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { message: "Channel authorisation failed." },
      { status: response.status },
    );
  }

  return NextResponse.json(await response.json());
}
