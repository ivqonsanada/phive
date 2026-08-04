import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/lib/icons";

/**
 * The original's footer: #001534 behind #b7c9e4 text, the mark and blurb on the left,
 * two link columns and a row of circular social buttons on the right, and the rights
 * line pinned bottom-right.
 *
 * The column headings are the original's. The links under them are not — the source
 * pointed "About Us" and "Careers" at routes that never existed, and reproducing dead
 * links to match a screenshot is not worth it. Real destinations are used instead.
 */
export function SiteFooter() {
  return (
    <footer className="bg-deep text-[#b7c9e4]">
      <div className="tracked mx-auto flex w-full max-w-[1280px] flex-col px-6 py-8 text-[14px] font-bold xl:flex-row xl:px-10 xl:py-8">
        <div className="xl:w-[561px]">
          <Image
            src="/images/footer-logo.svg"
            alt="PHive"
            width={32}
            height={32}
            className="mb-4"
          />
          <p className="mb-2">© {new Date().getFullYear()}</p>
          <p className="font-normal leading-relaxed">
            Expanding Student&apos;s Career by doing projects from their lecturer will give
            them a lot of benefits, our values is giving the same opportunity to all
            students who wants to get an experience working on project.
          </p>
        </div>

        <div className="mt-8 flex w-full flex-col justify-between xl:ml-auto xl:mt-0 xl:w-[529px]">
          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <FooterColumn title="Company">
              <FooterLink href="/explore">Explore</FooterLink>
              <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              <FooterLink href="/register">Join</FooterLink>
            </FooterColumn>

            <FooterColumn title="Further Information">
              <FooterLink href="https://github.com/ivqonsanada/phive">Source</FooterLink>
              <FooterLink href="https://github.com/ivqonsanada/phive/issues">
                Report a bug
              </FooterLink>
              <FooterLink href="https://github.com/ivqonsanada/phive/tree/legacy">
                Legacy version
              </FooterLink>
            </FooterColumn>

            <div>
              <p className="mb-3 text-white">Connect with us</p>
              <div className="flex flex-row gap-2.5">
                <SocialButton href="https://github.com/ivqonsanada" label="GitHub" icon="ant-design:github-filled" />
                <SocialButton href="https://www.linkedin.com/in/ivqonsanada" label="LinkedIn" icon="bx:bxl-linkedin" />
              </div>
            </div>
          </div>

          <p className="mt-8 font-normal xl:mt-0 xl:text-right">
            PHive, All Rights Reserved. | Created by FILKOM
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-white">{title}</p>
      <ul className="space-y-2 font-normal">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");

  return (
    <li>
      <Link
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="transition hover:text-glow"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-8 place-items-center rounded-full bg-white text-deep transition hover:bg-glow hover:text-white"
    >
      <Icon icon={icon} className="size-[18px]" aria-hidden />
    </Link>
  );
}
