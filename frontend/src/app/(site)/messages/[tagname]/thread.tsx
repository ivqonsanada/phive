"use client";

import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/avatar";
import { getEcho } from "@/lib/echo";
import { formatMessage } from "@/lib/markdown";
import type { UserSummary } from "@/lib/types";

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
 *
 * The original polled this endpoint every 20 seconds. A socket means a message appears
 * when it is sent rather than up to 20 seconds later, and costs no requests while the
 * conversation is idle.
 */
export function Thread({
  initialMessages,
  viewerUuid,
  partner,
}: {
  initialMessages: ThreadMessage[];
  viewerUuid: string;
  partner: UserSummary;
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
      if (event.sender_uuid !== partner.uuid) {
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
  }, [viewerUuid, partner.uuid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  return (
    <div className="mb-[62px] bg-[#eff1f4] px-3.5 py-4 xl:mb-0 xl:h-[405px] xl:overflow-y-scroll xl:rounded-t-[10px] xl:border xl:border-[#b0aeae] xl:px-6 xl:py-[27px] 2xl:h-[max(560px,58vh)]">
      {messages.length === 0 && (
        <p className="text-center text-[12px] text-ink/60 xl:text-[14px]">
          No messages yet. Say hello.
        </p>
      )}

      {messages.map((message, index) => {
        // The original spaced a run of messages from one person tighter than the gap
        // where the speaker changes, which is what makes a thread readable at a glance.
        const previous = messages[index - 1];
        const gap = !previous
          ? ""
          : previous.is_mine === message.is_mine
            ? message.is_mine
              ? "mt-2"
              : "mt-3"
            : "mt-6";

        if (message.is_mine) {
          return (
            <div key={message.uuid} className={`flex flex-row-reverse ${gap}`}>
              <Bubble tone="self">{formatMessage(message.message)}</Bubble>
            </div>
          );
        }

        return (
          <div key={message.uuid} className={`flex flex-row xl:items-end ${gap}`}>
            <Avatar
              src={partner.photo_url}
              size={35}
              shape="square"
              sizeClassName="size-[25px] xl:size-[35px]"
              className="xl:rounded-[10px]"
            />
            <div className="ml-2.5 min-w-0">
              {/* On desktop the person's name is already in the page heading, so the
                  per-message label is mobile-only. */}
              <div className="text-[10px] xl:hidden">{partner.name}</div>
              <Bubble tone="other">{formatMessage(message.message)}</Bubble>
            </div>
          </div>
        );
      })}

      <div ref={endRef} />
    </div>
  );
}

function Bubble({ tone, children }: { tone: "self" | "other"; children: React.ReactNode }) {
  return (
    <div
      className={`max-w-[305px] rounded-[5px] px-3 py-[9px] text-[12.8px] font-light leading-[1.65] shadow-[1px_2px_4px_rgba(0,0,0,0.1)] xl:max-w-[480px] xl:text-[14px] xl:font-normal ${
        tone === "self" ? "bg-[#dcdfff]" : "mr-[25px] mt-2.5 bg-white"
      }`}
    >
      {children}
    </div>
  );
}
