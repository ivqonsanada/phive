import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ChatHelp } from "@/app/(site)/messages/[tagname]/chat-help";
import { MessageComposer } from "@/app/(site)/messages/[tagname]/message-composer";
import { Thread, type ThreadMessage } from "@/app/(site)/messages/[tagname]/thread";
import { btnClear } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { Icon } from "@/lib/icons";
import type { UserSummary } from "@/lib/types";

type Params = { params: Promise<{ tagname: string }> };

export const metadata: Metadata = { title: "Message" };

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
    // The negative margins pull the chat out to the full width of a phone screen: the
    // original made this one surface edge to edge, with the composer pinned to the
    // bottom. `relative` is what that pinned composer positions against.
    <main className="relative -mx-[30px] -mb-[30px] flex-1 bg-[#eff1f4] xl:mx-auto xl:mb-0 xl:w-[1085px] xl:max-w-full xl:bg-white xl:px-0">
      {/* The original put this row in a bespoke mobile nav that replaced the site nav.
          This app keeps one header, so the row lives in the page at both sizes —
          otherwise a phone shows a conversation with nobody's name on it. */}
      <div className="flex flex-row items-center justify-between bg-white px-[30px] py-4 xl:bg-transparent xl:px-0">
        <div className="flex min-w-0 flex-row items-center">
          {/* Back to the list rather than history.back(): the original's back button
              could land you anywhere the conversation was opened from. */}
          <Link href="/messages" aria-label="All messages" className={`${btnClear} mr-[15px] flex`}>
            <Icon icon="eva:arrow-back-fill" className="size-[30px] xl:size-10" aria-hidden />
          </Link>
          <h1 className="truncate text-[20px] font-bold xl:text-[36px]">
            <Link href={`/u/${thread.with.tagname}`} className="text-ink no-underline hover:text-glow">
              {thread.with.name}
            </Link>
          </h1>
        </div>

        <ChatHelp />
      </div>

      <div>
        <Thread
          initialMessages={thread.messages}
          viewerUuid={viewer.uuid}
          partner={thread.with}
        />

        <MessageComposer tagname={thread.with.tagname} />
      </div>
    </main>
  );
}
