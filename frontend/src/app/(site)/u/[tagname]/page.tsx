import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProfileActions } from "@/app/(site)/u/[tagname]/profile-actions";
import { ProjectCard } from "@/components/project-card";
import { ApiError } from "@/lib/api";
import { getProfile } from "@/lib/projects";
import type { ProfilePayload } from "@/lib/types";

type Params = { params: Promise<{ tagname: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tagname } = await params;
  const { user } = await load(tagname);

  return { title: user.name, description: user.biography?.slice(0, 160) };
}

export default async function ProfilePage({ params }: Params) {
  const { tagname } = await params;
  const { user, projects } = await load(tagname);

  const heading = user.role === "Student" ? "Finished projects" : "Published projects";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-4">
          {user.photo_url ? (
            <Image
              src={user.photo_url}
              alt=""
              width={72}
              height={72}
              className="size-[72px] rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="grid size-[72px] place-items-center rounded-full bg-navy/10 text-xl font-bold text-navy/40">
              {user.first_name.charAt(0)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-navy">{user.name}</h1>
            <p className="text-sm text-ink/60">
              @{user.tagname} · {user.role}
              {user.expertise ? ` · ${user.expertise}` : ""}
            </p>
          </div>
        </div>

        {(user.university || user.location) && (
          <p className="mt-1 text-sm text-ink/60">
            {[user.major, user.faculty, user.university, user.location].filter(Boolean).join(" · ")}
          </p>
        )}

        {user.biography && <p className="mt-4 text-ink/80">{user.biography}</p>}

        {user.skills && user.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {user.skills.map((skill) => (
              <span key={skill} className="rounded bg-navy/5 px-2.5 py-1 text-xs text-navy">
                {skill}
              </span>
            ))}
          </div>
        )}

        <Suspense fallback={null}>
          <ProfileActions profile={user} />
        </Suspense>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {Object.entries(user.links)
            .filter(([, href]) => Boolean(href))
            .map(([name, href]) => (
              <Link
                key={name}
                href={href as string}
                rel="noopener noreferrer nofollow"
                target="_blank"
                className="capitalize text-navy hover:text-glow"
              >
                {name}
              </Link>
            ))}
        </div>
      </header>

      <h2 className="mb-3 font-semibold text-navy">{heading}</h2>

      {projects.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-8 text-center text-ink/60">
          Nothing here yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.uuid} project={project} />
          ))}
        </div>
      )}
    </main>
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
