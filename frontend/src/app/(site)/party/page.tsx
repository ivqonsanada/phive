import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { InviteForm } from "@/app/(site)/party/invite-form";
import { PartyCard } from "@/app/(site)/party/party-card";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { PartyPayload } from "@/lib/types";

export const metadata: Metadata = { title: "Party" };

export default async function PartyPage() {
  const user = await requireUser();

  if (user.role !== "Student") {
    redirect("/dashboard");
  }

  const { led, member_of } = await api<PartyPayload>("/party");

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Your party</h1>
      <p className="mb-8 text-sm text-ink/70">
        Recruit other students, then apply to projects together. Invitations land in
        their <Link href="/inbox" className="font-semibold text-navy hover:text-glow">inbox</Link>.
      </p>

      <section className="mb-10">
        <h2 className="mb-3 font-semibold text-navy">Party you lead</h2>

        {led ? (
          <PartyCard party={led} viewerIsLeader />
        ) : (
          <p className="mb-4 rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-ink/60">
            You haven&apos;t started a party. Inviting someone creates one.
          </p>
        )}

        <div className="mt-4">
          <InviteForm />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-semibold text-navy">Parties you&apos;re in</h2>

        {member_of.length === 0 ? (
          <p className="rounded-xl border border-dashed border-navy/20 p-6 text-center text-sm text-ink/60">
            You haven&apos;t joined anyone else&apos;s party yet.
          </p>
        ) : (
          <div className="space-y-3">
            {member_of.map((party) => (
              <PartyCard key={party.id} party={party} viewerIsLeader={false} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
