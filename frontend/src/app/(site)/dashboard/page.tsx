import type { Metadata } from "next";
import Link from "next/link";

import { ResendVerification } from "@/app/(site)/dashboard/resend-verification";
import { logout } from "@/app/actions/auth";
import { btn } from "@/components/ui/button";
import { UserInfoCard } from "@/components/user-info-card";
import { requireUser } from "@/lib/dal";
import { Icon } from "@/lib/icons";
import type { UserRole } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

const DESTINATIONS: {
  href: (tagname: string) => string;
  title: string;
  blurb: string;
  icon: string;
  role?: UserRole;
}[] = [
  {
    href: () => "/explore",
    title: "Explore Projects",
    blurb: "Everything open for applications right now.",
    icon: "ic:round-search",
  },
  {
    href: () => "/project-box",
    title: "Project Box",
    blurb: "Where each of your projects stands.",
    icon: "simple-icons:polymerproject",
  },
  {
    href: () => "/inbox",
    title: "Inbox",
    blurb: "Invitations and messages sent to you.",
    icon: "ion:mail-unread-sharp",
  },
  {
    href: () => "/messages",
    title: "Messages",
    blurb: "Your conversations.",
    icon: "entypo:email",
  },
  {
    href: () => "/party",
    title: "Party",
    blurb: "The team you apply with.",
    icon: "carbon:3rd-party-connected",
    role: "Student",
  },
  {
    href: () => "/wishlist",
    title: "Wishlist",
    blurb: "Projects you starred for later.",
    icon: "ant-design:star-filled",
    role: "Student",
  },
  {
    href: () => "/my/projects",
    title: "My Projects",
    blurb: "Post, edit and close out your projects.",
    icon: "ic:baseline-post-add",
    role: "Lecturer",
  },
  {
    href: (tagname) => `/u/${tagname}`,
    title: "Public Profile",
    blurb: "What everyone else sees.",
    icon: "ic:round-supervisor-account",
  },
];

/**
 * The original had no page at this address — its `/dashboard` was a *project* dashboard
 * for one ongoing project, and there was no account home at all; signing in dropped you
 * back on the public home page.
 *
 * This is where sign-in lands, so it is built as one: who you are, and the way in to
 * each of the things you own. It reuses the profile card the inbox, party and project
 * box all show, so it reads as part of that set rather than as a new place.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  const destinations = DESTINATIONS.filter(
    (destination) => !destination.role || destination.role === user.role,
  );

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-[30px] pb-[30px] pt-[5px] xl:mb-5 xl:max-w-[1125px]">
      <h2 className="mb-4 hidden text-[36px] font-extrabold uppercase xl:block">Dashboard</h2>

      <div className="flex w-full max-w-[720px] flex-col xl:max-w-[1125px] xl:flex-row xl:justify-center xl:gap-6">
        <UserInfoCard user={user} />

        <div className="w-full max-w-[720px] xl:max-w-[820px]">
          {!user.email_verified && (
            <div className="mb-6">
              <ResendVerification email={user.email} />
            </div>
          )}

          <div className="mb-7 flex flex-row items-center">
            <Icon icon="gridicons:stats-up-alt" className="mr-2.5 size-[30px]" aria-hidden />
            <h1 className="text-[20px] font-extrabold uppercase">Your PHive</h1>
          </div>

          <ul className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[15px]">
            {destinations.map((destination) => (
              <li key={destination.title}>
                <Link
                  href={destination.href(user.tagname)}
                  className="flex h-full flex-row items-start gap-4 rounded-[10px] bg-mist px-[25px] py-[18px] text-ink no-underline transition hover:bg-[#e8ebee]"
                >
                  <Icon
                    icon={destination.icon}
                    className="mt-[2px] size-6 shrink-0 text-navy"
                    aria-hidden
                  />
                  <span>
                    <span className="block text-[14px] font-bold leading-[1.15]">
                      {destination.title}
                    </span>
                    <span className="mt-1 block text-[12px] leading-[1.4] text-ink/70">
                      {destination.blurb}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2.5 xl:flex-row">
            <Link href="/settings" className={btn("white")}>
              Edit Profile
            </Link>
            <form action={logout}>
              <button type="submit" className={btn("decline")}>
                <Icon icon="entypo:log-out" className="size-[18px]" aria-hidden />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
