"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { LoginForm } from "@/app/(auth)/login/login-form";

type Role = "Student" | "Lecturer";

/**
 * The original's sign-in screen: a collage on the left whose images and headline swap
 * with the selected role, and the form on the right. The role is presentational here —
 * the API decides what an account actually is — but the swap is the page's whole
 * character, so it is kept.
 */
const ARTWORK: Record<Role, { top: string; midLeft: string; midRight: string; text: string }> = {
  Student: {
    top: "/images/login-top-student.png",
    midLeft: "/images/login-mid-left-1-student.png",
    midRight: "/images/login-mid-right-student.png",
    text: "Expand Your Careers.",
  },
  Lecturer: {
    top: "/images/login-top-lecturer.png",
    midLeft: "/images/login-mid-left-1-lecturer.png",
    midRight: "/images/login-mid-right-lecturer.png",
    text: "Project for Everyone",
  },
};

export function LoginView({
  social,
  justResetPassword,
}: {
  social: React.ReactNode;
  justResetPassword: boolean;
}) {
  const [role, setRole] = useState<Role>("Student");
  const art = ARTWORK[role];

  return (
    <main className="mx-auto flex w-full max-w-[1130px] flex-col gap-10 px-6 xl:h-dvh xl:flex-row xl:items-center xl:gap-24 xl:overflow-hidden">
      <div className="hidden w-[593px] shrink-0 flex-col justify-center xl:flex">
        <Image
          src={art.top}
          alt=""
          width={593}
          height={100}
          className="h-[100px] w-[593px] rounded-[15px] object-cover"
          priority
        />

        <div
          className={`mt-6 flex h-[379px] justify-between ${role === "Lecturer" ? "flex-row-reverse" : "flex-row"}`}
        >
          <div className="flex h-[379px] w-[193px] shrink-0 flex-col justify-between">
            <Image
              src={art.midLeft}
              alt=""
              width={193}
              height={193}
              className="size-[193px] rounded-[15px] object-cover"
            />
            <Link href="/">
              <Image
                src="/images/big-logo.png"
                alt="PHive"
                width={173}
                height={173}
                className="size-[173px] object-contain"
              />
            </Link>
          </div>

          <Image
            src={art.midRight}
            alt=""
            width={379}
            height={379}
            className="size-[379px] shrink-0 rounded-[15px] object-cover"
          />
        </div>

        {/* The other role's artwork, fetched but not shown. Without this the swap
            leaves an empty box for as long as the new images take to load — the boxes
            are pinned so nothing moves, but the flash is just as obvious. */}
        <div aria-hidden className="hidden">
          {Object.values(ARTWORK)
            .flatMap((set) => [set.top, set.midLeft, set.midRight])
            .map((src) => (
              <Image key={src} src={src} alt="" width={1} height={1} />
            ))}
        </div>

        <h2 className="mt-4 whitespace-nowrap text-[48px] font-extrabold uppercase leading-none text-black">
          {art.text}
        </h2>
      </div>

      {/* The column is 420px of content plus a 48px gutter, so the drawn
          scrollbar never sits against the form. */}
      <ScrollArea className="w-full xl:h-dvh xl:w-[468px]">
        <div className="flex min-h-dvh flex-col justify-center py-10 xl:pr-12">
        <Link href="/" className="mx-auto mb-6">
          <Image src="/images/logo-blue.svg" alt="PHive" width={95} height={42} priority />
        </Link>

        <h1 className="mb-4 text-center text-[24px] font-extrabold text-ink xl:text-left">
          Who are you?
        </h1>

        <div className="grid grid-cols-2 gap-5">
          {(Object.keys(ARTWORK) as Role[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setRole(option)}
              aria-pressed={role === option}
              className={`rounded-[10px] border-[1.6px] border-navy px-5 py-2.5 text-[18px] font-bold transition ${
                role === option ? "bg-navy text-white" : "bg-white text-navy hover:bg-mist"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="my-5 flex items-center gap-2 text-center text-[14px] text-ink">
          <span className="h-px flex-1 bg-black" />
          Sign In
          <span className="h-px flex-1 bg-black" />
        </div>

        {social}

        <LoginForm justResetPassword={justResetPassword} />

        <div className="mt-10 text-center text-[13px]">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-ink hover:text-glow">
              Sign Up
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="font-bold text-ink hover:text-glow">
              Forgot Password?
            </Link>
          </p>
        </div>

        <div className="mt-7 hidden text-center text-[14px] xl:block">
          PHive, All Rights Reserved. © {new Date().getFullYear()} . | Created by FILKOM
        </div>
        </div>
      </ScrollArea>
    </main>
  );
}
