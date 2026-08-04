"use client";

import Link from "next/link";
import { useState } from "react";

import { kickFromParty, leaveParty } from "@/app/actions/party";
import { Avatar } from "@/components/avatar";
import { btn } from "@/components/ui/button";
import { Modal, ModalSeparator, ModalTitle } from "@/components/ui/modal";
import type { Party, PartyMember } from "@/lib/types";

/**
 * The leader's view of their own party: one row per member, with a Kick button.
 * The original's `MemberItem`.
 */
export function MemberRow({ member }: { member: PartyMember }) {
  return (
    <div className="flex flex-row items-center justify-between xl:mr-2.5">
      <div className="flex flex-row gap-[15px] xl:items-center">
        <Link href={`/u/${member.user.tagname}`} className="my-auto">
          <Avatar
            src={member.user.photo_url}
            size={65}
            sizeClassName="size-[45px] xl:size-[65px]"
          />
        </Link>
        <div className="flex h-[75px] flex-col justify-around leading-[1.15]">
          <div className="text-[12px] font-bold sm:text-[14px] xl:text-[18px]">
            {member.user.name}
          </div>
          <div className="text-[12px] font-semibold sm:text-[14px] xl:text-[18px]">
            {member.expertise ?? "No expertise set"}
          </div>
        </div>
      </div>

      <form action={kickFromParty.bind(null, member.user.tagname)}>
        <button type="submit" className={btn("decline", { size: "chip" })}>
          Kick
        </button>
      </form>
    </div>
  );
}

/**
 * The member's view: a party is a scrolling strip of faces with a Details button that
 * opens the full roster. The original's `PartyItem` and `PartyMember`.
 */
export function PartyRow({ party }: { party: Party }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-between gap-5">
      {/* The scrollbar is hidden and the strip scrolls: a party of eight would
          otherwise squash every face to nothing. */}
      <div className="flex flex-row gap-2.5 overflow-x-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {party.members.map((member) => (
          <Avatar
            key={member.user.uuid}
            src={member.user.photo_url}
            size={65}
            className="xl:mr-2.5"
          />
        ))}
      </div>

      <div className="shrink-0">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={btn("blue", { size: "chip" })}
        >
          Details
        </button>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={<ModalTitle>Details</ModalTitle>}
          footer={
            <form action={leaveParty.bind(null, party.uuid)} className="ml-auto">
              {/* The original had no way out of a party — the only exit was being
                  kicked. Leaving belongs to the person, not to the leader. */}
              <button type="submit" className={btn("decline", { size: "small" })}>
                Leave this party
              </button>
            </form>
          }
        >
          <ModalSeparator />

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
            {party.members.map((member) => (
              <div
                key={member.user.uuid}
                className="flex flex-row gap-[15px] xl:flex-col xl:items-center xl:gap-0 xl:text-center"
              >
                <Link href={`/u/${member.user.tagname}`}>
                  <Avatar
                    src={member.user.photo_url}
                    size={85}
                    sizeClassName="size-[65px] xl:size-[85px]"
                  />
                </Link>
                <div className="flex flex-col justify-around">
                  <div className="text-[18px] font-bold">{member.user.name}</div>
                  <div className="mt-1 text-[18px] font-semibold">
                    {member.expertise ?? "No expertise set"}
                  </div>
                  {member.is_leader && (
                    <div className="mt-1 text-[14px] font-bold text-navy">Leader</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
}
