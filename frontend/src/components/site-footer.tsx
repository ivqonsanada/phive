import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-navy text-white/80">
      <div className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
        <div>
          <Image
            src="/images/footer-logo.svg"
            alt="PHive"
            width={40}
            height={40}
            className="mb-4"
          />
          <p className="mb-2 text-sm text-white/50">© {new Date().getFullYear()}</p>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Expanding a student&apos;s career by doing projects from their lecturer gives
            them a lot of benefits. Our value is giving the same opportunity to every
            student who wants experience working on a project.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <FooterColumn title="Platform">
            <FooterLink href="/explore">Explore</FooterLink>
            <FooterLink href="/leaderboard">Leaderboard</FooterLink>
            <FooterLink href="/register">Join</FooterLink>
          </FooterColumn>

          <FooterColumn title="Project">
            <FooterLink href="https://github.com/ivqonsanada/phive">Source</FooterLink>
            <FooterLink href="https://github.com/ivqonsanada/phive/issues">
              Report a bug
            </FooterLink>
            <FooterLink href="https://github.com/ivqonsanada/phive/tree/legacy">
              Legacy version
            </FooterLink>
          </FooterColumn>

          <FooterColumn title="Connect">
            <FooterLink href="https://github.com/ivqonsanada">GitHub</FooterLink>
            <FooterLink href="https://www.linkedin.com/in/ivqonsanada">LinkedIn</FooterLink>
          </FooterColumn>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto w-full max-w-5xl px-4 py-4 text-xs text-white/50">
          PHive, All Rights Reserved. · Created by FILKOM
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-white">{title}</p>
      <ul className="space-y-2 text-sm">{children}</ul>
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
        className="text-white/70 transition hover:text-glow"
      >
        {children}
      </Link>
    </li>
  );
}
