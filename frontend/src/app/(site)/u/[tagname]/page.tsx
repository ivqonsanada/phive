import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProfileActions } from "@/app/(site)/u/[tagname]/profile-actions";
import { ProjectCard } from "@/components/project-card";
import { ApiError } from "@/lib/api";
import { formatDateRange } from "@/lib/format";
import { Icon } from "@/lib/icons";
import { getProfile } from "@/lib/projects";
import type { ProfilePayload, User } from "@/lib/types";

type Params = {
  params: Promise<{ tagname: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tagname } = await params;
  const { user } = await load(tagname);

  return { title: user.name, description: user.biography?.slice(0, 160) };
}

/**
 * The original's visit page: a centred portrait with the name set very large, the two
 * actions beneath it, then Projects/Info tabs over a two-column body.
 *
 * The original also had a Wishlist tab showing anyone's saved projects. This API scopes
 * the wishlist to its owner, and publishing what every student has saved is not a
 * behaviour worth restoring, so the tab is not reproduced.
 */
export default async function ProfilePage({ params, searchParams }: Params) {
  const { tagname } = await params;
  const { tab } = await searchParams;
  const { user, projects } = await load(tagname);

  const active = tab === "projects" ? "projects" : "info";

  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-6 py-10">
      <header className="flex flex-col items-center justify-center">
        <Image
          src={user.photo_url ?? "/images/missing-avatar.svg"}
          alt=""
          width={175}
          height={175}
          className="mb-3 size-[150px] rounded-full object-cover xl:size-[175px] bg-[url('/images/missing-avatar.svg')] bg-cover bg-center"
          unoptimized
          priority
        />

        <h1 className="mb-3 max-w-[574px] text-center text-[36px] font-extrabold uppercase leading-[1.15] text-navy xl:text-[72px] xl:leading-[0.9]">
          {user.name}
        </h1>

        {user.expertise && (
          <p className="mb-5 text-center text-[24px] font-semibold leading-tight text-navy">
            {user.expertise}
          </p>
        )}

        {user.role === "Student" && user.points !== undefined && (
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-[10px] bg-navy px-4 py-1.5 text-[14px] font-bold text-white">
              {user.level}
            </span>
            <span className="rounded-[10px] bg-mist px-4 py-1.5 text-[14px] font-bold text-navy">
              {user.points.toLocaleString()} Points Collected
            </span>
          </div>
        )}

        <Suspense fallback={null}>
          <ProfileActions profile={user} />
        </Suspense>
      </header>

      <nav className="mb-5 mt-8 flex flex-row gap-10">
        <Tab href={`/u/${user.tagname}?tab=projects`} active={active === "projects"}>
          Projects
        </Tab>
        <Tab href={`/u/${user.tagname}`} active={active === "info"}>
          Info
        </Tab>
      </nav>

      <hr className="mb-8 border-t border-navy" />

      {active === "projects" ? (
        projects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
            Nothing here yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.uuid} project={project} />
            ))}
          </div>
        )
      ) : (
        <Info user={user} />
      )}
    </main>
  );
}

/** The original gave each network its own glyph rather than a bare word. */
const SOCIAL_ICONS: Record<string, string> = {
  behance: "ant-design:behance-outlined",
  github: "ant-design:github-filled",
  linkedin: "bx:bxl-linkedin",
  dribbble: "whh:dribbblealt",
  website: "whh:website",
};

function Info({ user }: { user: User }) {
  const socials = Object.entries(user.links).filter(([, href]) => Boolean(href));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <Section title="Biography">
          {user.biography ? (
            <p className="leading-relaxed text-ink">{user.biography}</p>
          ) : (
            <p className="text-ink/60">Nothing written yet.</p>
          )}
        </Section>

        <Section title="Skills">
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-[10px] bg-navy px-4 py-2.5 text-[16px] font-bold text-white"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-ink/60">No skills listed yet.</p>
          )}
        </Section>

        <Section title="Experience">
          {user.experiences && user.experiences.length > 0 ? (
            <ul className="space-y-4">
              {user.experiences.map((experience) => (
                <li key={experience.uuid}>
                  <p className="font-bold text-navy">{experience.project_name}</p>
                  <p className="text-ink">{experience.project_role}</p>
                  <p className="text-[14px] text-ink/60">
                    {formatDateRange(experience.start_date, experience.end_date)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink/60">No experiences to show yet</p>
          )}
        </Section>
      </div>

      <div>
        <Section title="Social Media">
          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {socials.map(([name, href]) => (
                <Link
                  key={name}
                  href={href as string}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="flex items-center gap-2 rounded-[10px] bg-mist px-4 py-2 text-[14px] font-bold capitalize text-navy transition hover:bg-navy hover:text-white"
                >
                  <Icon icon={SOCIAL_ICONS[name] ?? "ic:round-link"} className="size-[18px]" aria-hidden />
                  {name}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink/60">No links added yet.</p>
          )}
        </Section>

        <Section title="Curriculum Vitae">
          {user.cv_url ? (
            <Link
              href={user.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-bold text-navy hover:text-glow"
            >
              <Icon icon="bx:bxs-file-pdf" className="size-6" aria-hidden />
              {user.first_name} CV.pdf
            </Link>
          ) : (
            <p className="text-ink/60">He/She has not upload the CV yet.</p>
          )}
        </Section>

        {/* The original labelled this block "Curriculum Vitae" as well, which was
            plainly a copy-paste slip — it holds the tagname, not a CV. */}
        <Section title="Tagname">
          <p className="text-ink">@{user.tagname}</p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[24px] font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`text-[24px] font-bold transition ${
        active ? "text-deep" : "text-[#626262] hover:text-navy"
      }`}
    >
      {children}
    </Link>
  );
}

async function load(tagname: string): Promise<ProfilePayload> {
  try {
    return await getProfile(tagname);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}
