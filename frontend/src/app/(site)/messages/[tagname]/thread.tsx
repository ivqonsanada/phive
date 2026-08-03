"use client";

import { useEffect, useRef, useState } from "react";

import { getEcho } from "@/lib/echo";

export interface ThreadMessage {
  uuid: string;
  message: string;
  is_mine: boolean;
  created_at: string;
}

interface Incoming {
  uuid: string;
  message: string;
  sender_uuid: string;
  created_at: string;
}

/**
 * The thread is server-rendered, then kept current by the socket. Messages you send
 * arrive through the server action's revalidation; messages sent *to* you arrive on
 * your private channel.
 */
export function Thread({
  initialMessages,
  viewerUuid,
  partnerUuid,
}: {
  initialMessages: ThreadMessage[];
  viewerUuid: string;
  partnerUuid: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [seeded, setSeeded] = useState(initialMessages);
  const endRef = useRef<HTMLDivElement>(null);

  // A revalidated server render is the source of truth, so adopt it. Done during
  // render rather than in an effect — no extra pass, and no stale paint.
  if (seeded !== initialMessages) {
    setSeeded(initialMessages);
    setMessages(initialMessages);
  }

  useEffect(() => {
    const echo = getEcho();

    if (!echo) {
      return;
    }

    const channel = echo.private(`user.${viewerUuid}`);

    channel.listen(".message.sent", (event: Incoming) => {
      // Only messages from the person whose thread is open belong here.
      if (event.sender_uuid !== partnerUuid) {
        return;
      }

      setMessages((current) =>
        current.some((message) => message.uuid === event.uuid)
          ? current
          : [...current, { ...event, is_mine: false }],
      );
    });

    return () => {
      echo.leave(`user.${viewerUuid}`);
    };
  }, [viewerUuid, partnerUuid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <p className="mb-6 rounded-xl border border-dashed border-navy/20 p-8 text-center text-sm text-ink/60">
        No messages yet. Say hello.
      </p>
    );
  }

  return (
    <ul className="mb-6 space-y-2">
      {messages.map((message) => (
        <li
          key={message.uuid}
          className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
            message.is_mine ? "ml-auto bg-navy text-white" : "mr-auto bg-navy/5 text-ink"
          }`}
        >
          {/* Stored as plain text and rendered as text — never as markup. */}
          {message.message}
        </li>
      ))}
      <div ref={endRef} />
    </ul>
  );
}
