"use client";

import { useState } from "react";

import { BoxItem, type Box } from "@/app/(site)/project-box/box-item";
import { btnClear } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Icon } from "@/lib/icons";
import type { UserRole } from "@/lib/types";

const STUDENT_FILTERS = [
  "Waiting",
  "Accepted",
  "Rejected",
  "Waiting to Start",
  "Project Started",
  "Finished",
  "Bail Out",
];

const LECTURER_FILTERS = ["Draft", "Hiring", "Ongoing", "Confirmation", "Finished"];

/**
 * The right-hand column of the project box: heading, status filter, and the list. The
 * filter runs over the payload that is already here, as the original's did.
 */
export function BoxList({ boxes, role }: { boxes: Box[]; role: UserRole }) {
  const [showFilter, setShowFilter] = useState(false);
  const [status, setStatus] = useState("");

  const filters = role === "Student" ? STUDENT_FILTERS : LECTURER_FILTERS;
  const visible = status ? boxes.filter((box) => box.status === status) : boxes;

  return (
    <div className="w-full max-w-[720px] xl:max-w-[820px]">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="simple-icons:polymerproject" className="mr-2.5 size-[30px]" aria-hidden />
          <h2 className="text-[20px] font-extrabold uppercase">Project Box</h2>
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
            aria-label="Filter by project status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Project Status:</option>
            {filters.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="mt-7 flex flex-col gap-[15px]">
        {visible.map((box) => (
          <BoxItem key={box.uuid} box={box} role={role} />
        ))}

        {visible.length === 0 && (
          <p className="text-[12px] leading-[1.65] xl:text-[14px]">
            {status
              ? "There are no projects to be handled yet with this criteria"
              : "There are no projects to be handled yet"}
          </p>
        )}
      </div>
    </div>
  );
}
