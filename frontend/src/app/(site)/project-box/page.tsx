import type { Metadata } from "next";
import Link from "next/link";

import { ConfirmSeat } from "@/app/(site)/project-box/confirm-seat";
import { api } from "@/lib/api";
import { requireUser } from "@/lib/dal";
import type { Project } from "@/lib/types";

export const metadata: Metadata = { title: "Project box" };

interface Box {
  uuid: string;
  status: string;
  can_confirm: boolean;
  updated_at: string;
  project: Project;
}

export default async function ProjectBoxPage() {
  const user = await requireUser();
  const { boxes } = await api<{ boxes: Box[] }>("/project-box");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold text-navy">Project box</h1>
      <p className="mb-8 text-sm text-ink/70">
        {user.role === "Lecturer"
          ? "Every project you are running, and where each one stands."
          : "Everything you have applied to, and where each application stands."}
      </p>

      {boxes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-navy/20 p-10 text-center text-ink/60">
          Nothing here yet.{" "}
          <Link href="/explore" className="font-semibold text-navy hover:text-glow">
            Explore projects
          </Link>{" "}
          to get started.
        </p>
      ) : (
        <ul className="space-y-3">
          {boxes.map((box) => (
            <li key={box.uuid} className="rounded-xl border border-navy/10 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/projects/${box.project.project_url}`}
                    className="font-semibold text-navy hover:text-glow"
                  >
                    {box.project.title ?? "Untitled project"}
                  </Link>
                  <p className="text-xs uppercase tracking-wide text-ink/50">{box.status}</p>
                </div>

                {user.role === "Lecturer" && (
                  <Link
                    href={`/my/projects/${box.project.project_url}/shortlist`}
                    className="rounded-lg border border-navy/15 px-3 py-1.5 text-sm font-semibold text-navy hover:border-navy"
                  >
                    Applicants
                  </Link>
                )}
              </div>

              {box.can_confirm && <ConfirmSeat boxUuid={box.uuid} />}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
