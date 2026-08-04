"use client";

import { useState } from "react";

import { InboxRow } from "@/app/(site)/inbox/inbox-row";
import { btnClear } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Icon } from "@/lib/icons";
import type { InboxCategory, InboxItem, UserRole } from "@/lib/types";

/**
 * The right-hand column: the "Inbox" heading, the category filter, and the list.
 *
 * The filter is client-side because the payload already holds every item — the original
 * filtered the same array in a computed property rather than re-querying.
 */
export function InboxList({ items, role }: { items: InboxItem[]; role: UserRole }) {
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState<InboxCategory | "">("");

  // A lecturer never receives an invitation, so offering to filter by one is offering
  // an empty list.
  const categories: InboxCategory[] =
    role === "Student" ? ["Message", "Team Invitation", "Project Invitation"] : ["Message"];

  const visible = category ? items.filter((item) => item.category === category) : items;

  return (
    <div className="w-full max-w-[720px] xl:max-w-[820px]">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="ion:mail-unread-sharp" className="mr-2.5 size-[30px]" aria-hidden />
          <h2 className="text-[20px] font-extrabold uppercase">Inbox</h2>
        </div>

        <button
          type="button"
          onClick={() => setShowFilter((open) => !open)}
          aria-expanded={showFilter}
          className={btnClear}
        >
          <span className="flex h-[30px] w-auto items-center justify-center rounded-[5px] bg-navy p-[2px] text-white xl:h-[35px] xl:gap-1.5 xl:px-3">
            <Icon icon="ic:round-filter-list" className="size-6" aria-hidden />
            <span className="hidden text-[14px] font-bold xl:inline">Filters</span>
          </span>
        </button>
      </div>

      {showFilter && (
        <div className="my-[15px] flex flex-row justify-end xl:border-y xl:border-[#b0aeae] xl:py-3">
          <Select
            bordered
            className="w-full xl:max-w-[200px]"
            aria-label="Filter inbox by category"
            value={category}
            onChange={(event) => setCategory(event.target.value as InboxCategory | "")}
          >
            <option value="">Category:</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-7 flex flex-col gap-[15px]">
        {visible.map((item) => (
          <InboxRow key={item.uuid} item={item} />
        ))}

        {visible.length === 0 && (
          <p className="text-[12px] leading-[1.65] xl:text-[14px]">
            There isn&rsquo;t any Inbox yet
          </p>
        )}
      </div>
    </div>
  );
}
