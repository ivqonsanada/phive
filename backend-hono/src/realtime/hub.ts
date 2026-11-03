/**
 * A Pusher-protocol (v7) WebSocket hub, standing in for Laravel Reverb.
 *
 * The frontend connects with Laravel Echo + pusher-js exactly as it does to Reverb:
 * `wss://<api host>/app/<key>`. Only what PHive uses is implemented — private
 * channels, server-sent events, ping/pong. Presence channels and client events are
 * refused.
 *
 * One instance holds every connection. Sockets hibernate between messages, so idle
 * connections cost nothing; each socket's subscriptions live in its attachment and
 * survive hibernation.
 */
import { DurableObject } from "cloudflare:workers";

import type { Bindings } from "../env";
import { hmacHex, safeEqual } from "../lib/crypto";

interface SocketState {
  socketId: string;
  channels: string[];
}

const PING = JSON.stringify({ event: "pusher:ping", data: {} });
const PONG = JSON.stringify({ event: "pusher:pong", data: "{}" });

function frame(event: string, data: unknown, channel?: string): string {
  return JSON.stringify({
    event,
    ...(channel ? { channel } : {}),
    // The protocol double-encodes: `data` is itself a JSON string.
    data: typeof data === "string" ? data : JSON.stringify(data),
  });
}

function newSocketId(): string {
  const [a, b] = crypto.getRandomValues(new Uint32Array(2));
  return `${a! % 1_000_000_000}.${b! % 1_000_000_000}`;
}

/** The `auth` value a channel-auth endpoint returns: `<key>:<hmac(socket_id:channel)>`. */
export async function signChannel(
  key: string,
  secret: string,
  socketId: string,
  channel: string,
): Promise<string> {
  return `${key}:${await hmacHex(secret, `${socketId}:${channel}`)}`;
}

export class RealtimeHub extends DurableObject<Bindings> {
  constructor(ctx: DurableObjectState, env: Bindings) {
    super(ctx, env);
    // Answered by the runtime without waking the object.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair(PING, PONG));
  }

  override async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected a WebSocket upgrade", { status: 426 });
    }

    const { 0: client, 1: server } = new WebSocketPair();
    const state: SocketState = { socketId: newSocketId(), channels: [] };
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(state);
    server.send(
      frame("pusher:connection_established", {
        socket_id: state.socketId,
        activity_timeout: 30,
      }),
    );

    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let message: { event?: string; data?: unknown };
    try {
      message = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    } catch {
      return;
    }

    const state = ws.deserializeAttachment() as SocketState;
    const data =
      typeof message.data === "string"
        ? (JSON.parse(message.data || "{}") as Record<string, unknown>)
        : ((message.data ?? {}) as Record<string, unknown>);

    switch (message.event) {
      case "pusher:ping":
        ws.send(PONG);
        return;

      case "pusher:subscribe": {
        const channel = String(data.channel ?? "");
        if (!(await this.authorised(state.socketId, channel, data.auth))) {
          ws.send(
            frame("pusher:subscription_error", {
              type: "AuthError",
              error: "Connection is unauthorized",
              status: 401,
            }, channel),
          );
          return;
        }
        if (!state.channels.includes(channel)) {
          state.channels.push(channel);
          ws.serializeAttachment(state);
        }
        ws.send(frame("pusher_internal:subscription_succeeded", "{}", channel));
        return;
      }

      case "pusher:unsubscribe": {
        state.channels = state.channels.filter((c) => c !== String(data.channel ?? ""));
        ws.serializeAttachment(state);
        return;
      }

      default:
        ws.send(frame("pusher:error", { code: 4301, message: "Client events are not supported" }));
    }
  }

  override async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    ws.close(code === 1005 ? 1000 : code, "closing");
  }

  /** Called by the API over RPC after a write that should reach open clients. */
  async publish(channel: string, event: string, payload: unknown): Promise<number> {
    const message = frame(event, payload, channel);
    let delivered = 0;
    for (const ws of this.ctx.getWebSockets()) {
      const state = ws.deserializeAttachment() as SocketState | null;
      if (state?.channels.includes(channel)) {
        ws.send(message);
        delivered++;
      }
    }
    return delivered;
  }

  private async authorised(socketId: string, channel: string, auth: unknown): Promise<boolean> {
    // Only private channels exist in PHive; a public or presence subscription is refused.
    if (!channel.startsWith("private-") || typeof auth !== "string") return false;
    const expected = await signChannel(
      this.env.REALTIME_APP_KEY,
      this.env.APP_KEY,
      socketId,
      channel,
    );
    return safeEqual(auth, expected);
  }
}
