import type { Metadata } from "next";
import Link from "next/link";

import { InboxRow } from "@/app/(site)/inbox/inbox-row";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { InboxPayload } from "@/lib/types";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  await requireUser();

  const { items, unread_count } = await api<InboxPayload>("/inbox");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Inbox</h1>
      <p className="mb-8 text-sm text-ink/70">
        {unread_count > 0 ? `${unread_count} unread` : "Nothing unread."}
      </p>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          No invitations or messages yet. Ask a friend to invite you to their{" "}
          <Link href="/party" className="font-semibold text-navy hover:text-glow">
            party
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <InboxRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </main>
  );
}
