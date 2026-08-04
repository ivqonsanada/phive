import Link from "next/link";

import { markInboxRead, respondToInvitation } from "@/app/actions/inbox";
import { Avatar } from "@/components/avatar";
import type { InboxItem } from "@/lib/types";

export function InboxRow({ item }: { item: InboxItem }) {
  const pending =
    (item.category === "Team Invitation" && item.team?.status === "Pending") ||
    (item.category === "Project Invitation" && item.project?.status === "Pending");

  return (
    <li
      className={`rounded-xl border p-4 ${
        item.is_read ? "border-navy/10" : "border-glow/40 bg-glow/5"
      }`}
    >
      <div className="mb-3 flex flex-row items-center gap-3">
        <Avatar src={item.sender?.photo_url} size={48} />
        <div className="min-w-0">
          <p className="truncate font-bold text-navy">{item.sender?.name ?? "PHive"}</p>
          {item.sender?.expertise && (
            <p className="truncate text-[14px] text-ink/60">{item.sender.expertise}</p>
          )}
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          {item.category}
        </span>
        {!item.is_read && (
          <span className="rounded-full bg-glow px-2 py-0.5 text-xs font-semibold text-white">
            New
          </span>
        )}
        <time className="ml-auto text-xs text-ink/40">
          {new Date(item.created_at).toLocaleDateString()}
        </time>
      </div>

      <p className="text-sm text-ink/80">{describe(item)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {pending ? (
          <>
            <form action={respondToInvitation.bind(null, item.uuid, true)}>
              <button
                type="submit"
                className="rounded-lg bg-navy px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-navy/90"
              >
                Accept
              </button>
            </form>
            <form action={respondToInvitation.bind(null, item.uuid, false)}>
              <button type="submit" className="text-sm font-semibold text-glow hover:underline">
                Decline
              </button>
            </form>
          </>
        ) : (
          <span className="text-sm text-ink/50">
            {item.team?.status ?? item.project?.status ?? "No action needed"}
          </span>
        )}

        {!item.is_read && (
          <form action={markInboxRead.bind(null, item.uuid)} className="ml-auto">
            <button type="submit" className="text-sm text-ink/60 hover:text-glow">
              Mark as read
            </button>
          </form>
        )}
      </div>
    </li>
  );
}

function describe(item: InboxItem) {
  const sender = (
    <Link href={`/u/${item.sender.tagname}`} className="font-semibold text-navy hover:text-glow">
      {item.sender.name}
    </Link>
  );

  switch (item.category) {
    case "Team Invitation":
      return <>{sender} invited you to join their party.</>;
    case "Project Invitation":
      return (
        <>
          {sender} invited you to work on{" "}
          {item.project?.project_url ? (
            <Link
              href={`/projects/${item.project.project_url}`}
              className="font-semibold text-navy hover:text-glow"
            >
              {item.project.title}
            </Link>
          ) : (
            <span className="font-semibold">{item.project?.title}</span>
          )}
          .
        </>
      );
    default:
      return (
        <>
          {sender}: {item.message}
        </>
      );
  }
}
