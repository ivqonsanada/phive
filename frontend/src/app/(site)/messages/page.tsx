import type { Metadata } from "next";
import Link from "next/link";

import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { timeAgo } from "@/lib/format";
import type { UserSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

interface Conversation {
  with: UserSummary;
  last_message: string | null;
  last_message_at: string | null;
}

export default async function MessagesPage() {
  await requireUser();

  const { conversations } = await api<{ conversations: Conversation[] }>("/messages");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Messages</h1>
      <p className="mb-8 text-sm text-ink/70">
        Start a conversation from anyone&apos;s profile.
      </p>

      {conversations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          No conversations yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li key={conversation.with.uuid}>
              <Link
                href={`/messages/${conversation.with.tagname}`}
                className="flex items-center gap-3 rounded-xl border border-navy/10 p-4 transition hover:border-navy/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-navy">{conversation.with.name}</p>
                  <p className="truncate text-sm text-ink/60">
                    {conversation.last_message ?? "No messages yet"}
                  </p>
                </div>
                {conversation.last_message_at && (
                  <time className="shrink-0 text-xs text-ink/40">
                    {timeAgo(conversation.last_message_at)}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
