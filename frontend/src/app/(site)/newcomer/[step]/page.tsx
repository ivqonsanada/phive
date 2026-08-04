import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaManager } from "@/app/(site)/settings/media-manager";
import { BiodataStep, ExpertiseStep } from "@/app/(site)/newcomer/steps";
import { Stepper } from "@/app/(site)/newcomer/stepper";
import { TopImage } from "@/components/top-image";
import { btn } from "@/components/ui/button";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { User } from "@/lib/types";

type Params = { params: Promise<{ step: string }> };

export const metadata: Metadata = { title: "Welcome" };

/**
 * The original's `/newcomer/1..3`: the walkthrough a new account is dropped into, so
 * the first thing anyone does is not stare at an empty profile.
 *
 * Each step is a URL of its own, as the original had it, so Back works and a
 * half-finished profile can be returned to later.
 */
export default async function NewcomerPage({ params }: Params) {
  await requireUser();
  const { step } = await params;

  if (step !== "1" && step !== "2" && step !== "3") {
    notFound();
  }

  // Re-read with relations: the DAL's cached copy is the lightweight session user.
  const user = await api<User>("/user");
  const current = Number(step) as 1 | 2 | 3;

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col justify-between px-8 pb-10 pt-3">
      <div>
        <TopImage type={2} />

        <h1 className="text-center text-[24px] font-extrabold xl:text-[48px]">
          Hello, {user.name}
        </h1>

        <Stepper step={current} />

        {current === 1 && (
          <>
            <div className="mb-8">
              <MediaManager user={user} />
            </div>
            <BiodataStep user={user} />
          </>
        )}

        {current === 2 && <ExpertiseStep user={user} />}

        {current === 3 && (
          <div className="flex flex-col justify-between">
            <h2 className="mt-0 text-center text-[30px] font-extrabold uppercase">
              Get Ready to Dive in with Project Hive!
            </h2>
            <p className="mb-[30px] text-center text-[18px] leading-[21.5px]">
              Climb to the top and find the exciting experience through out the process
            </p>

            <Link href="/explore" className={`${btn("blue", { size: "large" })} mx-auto`}>
              Dive In
            </Link>
          </div>
        )}
      </div>

      {current === 3 && (
        <div className="mt-[30px] flex flex-col items-center gap-1.5">
          <Image src="/images/footer-logo-black.png" alt="" width={40} height={40} />
          <div className="text-[12px]">
            PHive, All Rights Reserved. &copy; {new Date().getFullYear()}
          </div>
        </div>
      )}
    </main>
  );
}
