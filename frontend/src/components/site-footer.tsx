import Image from "next/image";
import Link from "next/link";

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
                <SocialButton href="https://github.com/ivqonsanada" label="GitHub">
                  <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A10 10 0 0 0 12 2z" />
                </SocialButton>
                <SocialButton href="https://www.linkedin.com/in/ivqonsanada" label="LinkedIn">
                  <path d="M6.9 8.4H3.6V21h3.3V8.4zM5.3 3a1.9 1.9 0 1 0 0 3.9 1.9 1.9 0 0 0 0-3.9zM21 13.9c0-3.2-1.7-4.7-4-4.7-1.8 0-2.7 1-3.1 1.7V8.4H10.6c0 .9 0 12.6 0 12.6h3.3v-7c0-.4 0-.7.1-.9.3-.7.9-1.4 1.9-1.4 1.4 0 1.9 1 1.9 2.5V21H21v-7.1z" />
                </SocialButton>
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

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid size-8 place-items-center rounded-full bg-white text-deep transition hover:bg-glow hover:text-white"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
        {children}
      </svg>
    </Link>
  );
}
