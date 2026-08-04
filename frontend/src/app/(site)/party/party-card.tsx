import Link from "next/link";

import { kickFromParty, leaveParty } from "@/app/actions/party";
import type { Party } from "@/lib/types";
import { Avatar } from "@/components/avatar";

export function PartyCard({ party, viewerIsLeader }: { party: Party; viewerIsLeader: boolean }) {
  return (
    <div className="rounded-xl border border-navy/10 p-4">
      {!viewerIsLeader && (
        <p className="mb-3 text-sm text-ink/60">
          Led by{" "}
          <Link href={`/u/${party.leader.tagname}`} className="font-semibold text-navy hover:text-glow">
            {party.leader.name}
          </Link>
        </p>
      )}

      <ul className="space-y-2">
        {party.members.map((member) => (
          <li key={member.user.uuid} className="flex items-center gap-3 text-sm">
            <Avatar src={member.user.photo_url} size={40} />
            <Link href={`/u/${member.user.tagname}`} className="text-navy hover:text-glow">
              {member.user.name}
            </Link>

            {member.is_leader && (
              <span className="rounded bg-navy/5 px-2 py-0.5 text-xs font-semibold text-navy">
                Leader
              </span>
            )}

            <span className="text-xs text-ink/50">{member.expertise ?? "No expertise set"}</span>

            {viewerIsLeader && !member.is_leader && (
              <form action={kickFromParty.bind(null, member.user.tagname)} className="ml-auto">
                <button type="submit" className="text-xs font-semibold text-glow hover:underline">
                  Remove
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {!viewerIsLeader && (
        <form action={leaveParty.bind(null, party.uuid)} className="mt-3">
          <button type="submit" className="text-sm font-semibold text-glow hover:underline">
            Leave this party
          </button>
        </form>
      )}
    </div>
  );
}
