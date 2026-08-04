"use client";

import { useState } from "react";

import { InviteForm } from "@/app/(site)/party/invite-form";
import { MemberRow, PartyRow } from "@/app/(site)/party/party-card";
import { btn } from "@/components/ui/button";
import { Icon } from "@/lib/icons";
import type { PartyPayload } from "@/lib/types";

/**
 * The original showed one of two things and a button to swap between them: the party
 * you lead, or the parties you are in. Both at once would be two lists of faces under
 * one heading with nothing saying which is which.
 *
 * The toggle is local state rather than two routes — the payload holds both, so a
 * round trip to see the other half would fetch what is already here.
 */
export function PartyPanel({ party }: { party: PartyPayload }) {
  const [asLeader, setAsLeader] = useState(true);

  return (
    <div className="flex w-full max-w-[720px] flex-col xl:max-w-[600px]">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <Icon
            icon="carbon:3rd-party-connected"
            className="mr-2.5 size-[30px]"
            aria-hidden
          />
          <h2 className="text-[20px] font-extrabold uppercase">Party</h2>
        </div>
      </div>

      <div className="mt-7 flex flex-col">
        {asLeader ? (
          <>
            {party.led && party.led.members.length > 0 ? (
              <div className="flex flex-col gap-[15px]">
                {party.led.members
                  // The leader is in their own members list; a Kick button beside your
                  // own face is not an action anyone wants offered.
                  .filter((member) => !member.is_leader)
                  .map((member) => (
                    <MemberRow key={member.user.uuid} member={member} />
                  ))}
              </div>
            ) : (
              <p className="text-[12px] leading-[1.65] xl:text-[14px]">
                Let&rsquo;s invite someone to your party! :D
              </p>
            )}

            <div className="mt-6">
              <InviteForm />
            </div>
          </>
        ) : party.member_of.length > 0 ? (
          <div className="flex flex-col gap-[15px]">
            {party.member_of.map((joined) => (
              <PartyRow key={joined.uuid} party={joined} />
            ))}
          </div>
        ) : (
          <p className="text-[12px] leading-[1.65] xl:text-[14px]">Hope you get party soon :)</p>
        )}
      </div>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={() => setAsLeader((leader) => !leader)}
          className={btn("blue")}
        >
          Switch to {asLeader ? "Member" : "Leader"}
        </button>
      </div>
    </div>
  );
}
