"use client";

import Link from "next/link";
import { useState } from "react";

import { markInboxRead, respondToInvitation } from "@/app/actions/inbox";
import { Avatar } from "@/components/avatar";
import { ProjectBox, ProjectBoxActions, ProjectBoxRow } from "@/components/project-box";
import { btn, btnClear } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import type { InboxItem } from "@/lib/types";

/**
 * The original split this into three components — message, team invitation, project
 * invitation — that shared a layout and differed only in their copy and buttons. They
 * are one component here, because three files that agree on their markup drift.
 *
 * Client-side for the mobile disclosure: on a narrow screen the explanation and the
 * buttons are behind a "Details" toggle, and only the name and the action are shown.
 */
export function InboxRow({ item }: { item: InboxItem }) {
  const [showDetails, setShowDetails] = useState(false);

  const status = item.team?.status ?? item.project?.status ?? null;
  const pending = status === "Pending";
  const isMessage = item.category === "Message";

  const actions = pending ? (
    <div className="flex flex-col">
      <form action={respondToInvitation.bind(null, item.uuid, true)}>
        <button type="submit" className={btn("blue", { size: "small" })}>
          {item.category === "Team Invitation" ? "Agree to Join Team" : "Agree to Join Project"}
        </button>
      </form>
      <form action={respondToInvitation.bind(null, item.uuid, false)} className="mt-2.5">
        <button type="submit" className={btn("decline", { size: "small" })}>
          Decline
        </button>
      </form>
    </div>
  ) : status ? (
    <p className="text-[12px] font-bold text-ink/60">{status}</p>
  ) : null;

  return (
    <ProjectBox>
      <ProjectBoxRow>
        <Link href={`/u/${item.sender.tagname}`}>
          <Avatar
            src={item.sender.photo_url}
            size={100}
            shape="square"
            sizeClassName="size-[50px] xl:size-[100px]"
          />
        </Link>

        <div className="grid w-full min-w-0 xl:block">
          {isMessage ? (
            <MessageBody item={item} />
          ) : (
            <>
              <div className="mb-[5px] overflow-hidden text-[14px] leading-[1.15] xl:mb-2.5">
                <span className="font-bold">{item.sender.name}</span>{" "}
                <span className="font-normal xl:font-bold">
                  {item.category === "Team Invitation"
                    ? "Invited you to do a team project"
                    : "Invited you to join a project"}
                </span>
              </div>

              {/* Mobile: a disclosure. Desktop: the explanation is simply there. */}
              <button
                type="button"
                onClick={() => setShowDetails((open) => !open)}
                aria-expanded={showDetails}
                className={`${btnClear} flex flex-row items-center justify-between xl:hidden`}
              >
                <span className="text-[12px] font-bold leading-[14px] underline">Details</span>
                {showDetails && (
                  <Icon
                    icon="ion:close"
                    className="size-[14px] text-[#9d9d9d]"
                    aria-hidden
                  />
                )}
              </button>

              <div className="hidden xl:block">
                <Explanation item={item} />
              </div>
            </>
          )}
        </div>

        {/* The desktop action column. `hidden xl:block` rather than a second render of
            the same buttons, which is what the original did — two copies of an Accept
            button is two places to forget to change. */}
        <ProjectBoxActions className="hidden shrink-0 xl:block">
          {isMessage ? (
            <Link
              href={`/messages/${item.sender.tagname}`}
              className={btn("blue", { width: "w-[200px]" })}
            >
              See Chat
            </Link>
          ) : (
            actions
          )}
        </ProjectBoxActions>
      </ProjectBoxRow>

      {/* The mobile disclosure body. */}
      {!isMessage && showDetails && (
        <ProjectBoxActions className="xl:hidden">
          <Explanation item={item} />
          {actions}
        </ProjectBoxActions>
      )}

      {isMessage && (
        <Link
          href={`/messages/${item.sender.tagname}`}
          className={`${btn("blue", { size: "small" })} mt-[22px] xl:hidden`}
        >
          See Chat
        </Link>
      )}

      {/* The original cleared the whole inbox's unread badge when you opened the page;
          this API tracks it per item, so the control is kept, styled as the original's
          small underlined link rather than as another button competing with Accept. */}
      {!item.is_read && (
        <form action={markInboxRead.bind(null, item.uuid)} className="mt-2.5 self-end">
          <button
            type="submit"
            className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-bold underline hover:text-glow"
          >
            Mark as read
          </button>
        </form>
      )}
    </ProjectBox>
  );
}

function MessageBody({ item }: { item: InboxItem }) {
  // The original replaced any message containing an image with this, rather than
  // rendering markdown into a one-line preview.
  const preview = item.message?.includes("img") ? "Sent an image" : item.message;

  return (
    <Link href={`/messages/${item.sender.tagname}`} className="text-ink no-underline">
      <p className="mb-[5px] truncate text-[14px] font-bold leading-[1.15] xl:mb-2.5">
        {item.sender.name}
      </p>
      <p className="line-clamp-2 text-[12px] font-light leading-[1.3] xl:line-clamp-4 xl:font-normal xl:leading-[1.65]">
        {preview}
      </p>
    </Link>
  );
}

function Explanation({ item }: { item: InboxItem }) {
  if (item.category === "Team Invitation") {
    return (
      <p className="text-[12px] leading-[1.65]">
        You&rsquo;re invited to join a team project. If you agree to join this team, click{" "}
        <i>Agree to Join Team</i> and you can see your party at the party tab. If you decline,
        click <i>Decline</i>.
      </p>
    );
  }

  return (
    <>
      <p className="text-[12px] leading-[1.65]">
        You&rsquo;re invited to join project:{" "}
        <span className="font-bold text-navy">&ldquo;{item.project?.title}&rdquo;</span>. You can
        see the detail about the project by clicking the see project details on the button below.
        If you&rsquo;re agree to join this project please notify the lecturer about your
        agreement. If you&rsquo;re not interested joining the project please state the reason to
        the lecturer by sending a message.
      </p>
      {item.project?.project_url && (
        <Link
          href={`/projects/${item.project.project_url}`}
          className="my-2.5 block py-2.5 text-center text-[12px] font-bold text-ink"
        >
          See Project Details
        </Link>
      )}
    </>
  );
}
