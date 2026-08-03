import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MessageComposer } from "@/app/(site)/messages/[tagname]/message-composer";
import { ApiError, api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { UserSummary } from "@/lib/types";

type Params = { params: Promise<{ tagname: string }> };

export const metadata: Metadata = { title: "Conversation" };

interface Thread {
  with: UserSummary;
  messages: { id: number; message: string; is_mine: boolean; created_at: string }[];
}

export default async function ConversationPage({ params }: Params) {
  await requireUser();
  const { tagname } = await params;

  let thread: Thread;

  try {
    thread = await api<Thread>(`/messages/${encodeURIComponent(tagname)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10">
      <Link href="/messages" className="mb-4 text-sm font-semibold text-navy hover:text-glow">
        ← All messages
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-navy">
        <Link href={`/u/${thread.with.tagname}`} className="hover:text-glow">
          {thread.with.name}
        </Link>
      </h1>

      {thread.messages.length === 0 ? (
        <p className="mb-6 rounded-xl border border-dashed border-navy/20 p-8 text-center text-sm text-ink/60">
          No messages yet. Say hello.
        </p>
      ) : (
        <ul className="mb-6 space-y-2">
          {thread.messages.map((message) => (
            <li
              key={message.id}
              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm ${
                message.is_mine
                  ? "ml-auto bg-navy text-white"
                  : "mr-auto bg-navy/5 text-ink"
              }`}
            >
              {/* Stored as plain text and rendered as text — never as markup. */}
              {message.message}
            </li>
          ))}
        </ul>
      )}

      <MessageComposer tagname={thread.with.tagname} />
    </main>
  );
}
