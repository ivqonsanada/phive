import type { Metadata } from "next";
import Link from "next/link";

import { Avatar } from "@/components/avatar";
import { ProjectBox } from "@/components/project-box";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import { timeAgo } from "@/lib/format";
import { Icon } from "@/lib/icons";
import type { UserSummary } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

interface Conversation {
  with: UserSummary;
  last_message: string | null;
  last_message_at: string | null;
}

/**
 * The original had no conversation list — you reached a chat from the inbox or from
 * someone's profile, and there was no way to see who you had talked to. The page is
 * kept, and built from the same parts as the inbox so it does not read as a bolt-on.
 */
export default async function MessagesPage() {
  await requireUser();

  const { conversations } = await api<{ conversations: Conversation[] }>("/messages");

  return (
    <main className="mx-auto w-full max-w-[720px] flex-1 px-[30px] pb-[30px] pt-[5px] xl:max-w-[820px]">
      <div className="mb-7 flex flex-row items-center">
        <Icon icon="entypo:email" className="mr-2.5 size-[30px]" aria-hidden />
        <h1 className="text-[20px] font-extrabold uppercase xl:text-[36px]">Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <p className="text-[12px] leading-[1.65] xl:text-[14px]">
          There isn&rsquo;t any conversation yet. Start one from anyone&rsquo;s profile.
        </p>
      ) : (
        <ul className="flex flex-col gap-[15px]">
          {conversations.map((conversation) => (
            <li key={conversation.with.uuid}>
              <Link
                href={`/messages/${conversation.with.tagname}`}
                className="block text-ink no-underline"
              >
                <ProjectBox className="transition hover:bg-[#e8ebee]">
                  <div className="flex flex-row items-center gap-4 xl:gap-[26px]">
                    <Avatar
                      src={conversation.with.photo_url}
                      size={100}
                      shape="square"
                      sizeClassName="size-[50px] xl:size-[100px]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="mb-[5px] truncate text-[14px] font-bold leading-[1.15] xl:mb-2.5">
                        {conversation.with.name}
                      </p>
                      <p className="line-clamp-2 text-[12px] font-light leading-[1.3] xl:font-normal xl:leading-[1.65]">
                        {conversation.last_message ?? "No messages yet"}
                      </p>
                    </div>
                    {conversation.last_message_at && (
                      <time className="shrink-0 self-start text-[12px] text-ink/50">
                        {timeAgo(conversation.last_message_at)}
                      </time>
                    )}
                  </div>
                </ProjectBox>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
