import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MessageComposer } from "@/app/(site)/messages/[tagname]/message-composer";
import { Thread, type ThreadMessage } from "@/app/(site)/messages/[tagname]/thread";
import { ApiError, api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { UserSummary } from "@/lib/types";

type Params = { params: Promise<{ tagname: string }> };

export const metadata: Metadata = { title: "Conversation" };

interface ThreadPayload {
  with: UserSummary;
  messages: ThreadMessage[];
}

export default async function ConversationPage({ params }: Params) {
  const viewer = await requireUser();
  const { tagname } = await params;

  let thread: ThreadPayload;

  try {
    thread = await api<ThreadPayload>(`/messages/${encodeURIComponent(tagname)}`);
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

      <Thread
        initialMessages={thread.messages}
        viewerUuid={viewer.uuid}
        partnerUuid={thread.with.uuid}
      />

      <MessageComposer tagname={thread.with.tagname} />
    </main>
  );
}
