/**
 * backend/app/Http/Resources, key for key and in the same order. Resources are never
 * wrapped in `data`; keys for relations that were not loaded are omitted.
 */
import type {
  experiences,
  leaderboards,
  projectReviews,
  projects,
  User,
} from "../db/schema";
import { EXPERTISE_COLUMN, levelForPoints } from "../domain/enums";
import type { Bindings } from "../env";
import { iso, isoDate } from "../lib/http";
import { storageUrl } from "../lib/storage";

type Experience = typeof experiences.$inferSelect;
type Board = typeof leaderboards.$inferSelect;
type ProjectRow = typeof projects.$inferSelect;
type Review = typeof projectReviews.$inferSelect;

export type Json = Record<string, unknown>;

const fullName = (u: Pick<User, "first_name" | "last_name">) =>
  `${u.first_name} ${u.last_name ?? ""}`.trim();

export function userSummary(env: Bindings, u: User, finishedProjectCount?: number): Json {
  return {
    uuid: u.id,
    tagname: u.tagname,
    first_name: u.first_name,
    last_name: u.last_name ?? "",
    name: fullName(u),
    role: u.role,
    photo_url: storageUrl(env, u.photo_url),
    expertise: u.expertise,
    ...(finishedProjectCount === undefined ? {} : { finished_project_count: finishedProjectCount }),
  };
}

export function experienceResource(e: Experience): Json {
  return {
    uuid: e.id,
    project_name: e.project_name,
    project_role: e.project_role,
    start_date: isoDate(e.start_date),
    end_date: isoDate(e.end_date),
  };
}

export interface UserRelations {
  skills?: string[];
  experiences?: Experience[];
  leaderboards?: Board[];
  unread_inbox_count?: number;
}

export function userResource(
  env: Bindings,
  u: User,
  rel: UserRelations = {},
  // A deliberate difference from Laravel, which put every user's email and identity
  // number on their public profile.
  { hidePrivate = false }: { hidePrivate?: boolean } = {},
): Json {
  const points = rel.leaderboards ? Math.max(0, ...rel.leaderboards.map((b) => b.points)) : 0;
  return {
    uuid: u.id,
    tagname: u.tagname,
    first_name: u.first_name,
    last_name: u.last_name ?? "",
    name: fullName(u),
    role: u.role,
    email: hidePrivate ? null : u.email,
    email_verified: u.email_verified_at !== null,
    identity_number: hidePrivate ? null : u.identity_number,
    photo_url: storageUrl(env, u.photo_url),
    expertise: u.expertise,
    university: u.university,
    faculty: u.faculty,
    major: u.major,
    location: u.location,
    biography: u.biography,
    is_open_hired: Boolean(u.is_open_hired),
    cv_url: storageUrl(env, u.cv_url),
    links: {
      behance: u.behance,
      github: u.github,
      linkedin: u.linkedin,
      dribbble: u.dribbble,
      website: u.website,
    },
    ...(rel.skills ? { skills: rel.skills } : {}),
    ...(rel.experiences ? { experiences: rel.experiences.map(experienceResource) } : {}),
    ...(rel.leaderboards
      ? {
          leaderboards: rel.leaderboards.map((b) => ({
            uuid: b.id,
            expertise: b.expertise,
            points: b.points,
          })),
          points,
          level: levelForPoints(points),
        }
      : {}),
    ...(rel.unread_inbox_count === undefined ? {} : { unread_inbox_count: rel.unread_inbox_count }),
    created_at: iso(u.created_at),
  };
}

export function lookingFor(p: ProjectRow): string[] {
  return Object.entries(EXPERTISE_COLUMN)
    .filter(([, column]) => p[column])
    .map(([expertise]) => expertise);
}

export interface ProjectRelations {
  user: Json;
  is_wished?: boolean;
  skills?: string[];
  requirements?: string[];
  team?: Json | null;
  review?: Review | null;
}

export function projectResource(env: Bindings, p: ProjectRow, rel: ProjectRelations): Json {
  return {
    uuid: p.id,
    title: p.title,
    description: p.description,
    project_url: p.project_url,
    status: p.status,
    thumbnail: storageUrl(env, p.thumbnail),
    applicant_type: p.applicant_type,
    max_person: p.max_person,
    level_applicant: p.level_applicant,
    looking_for: lookingFor(p),
    reward: {
      certificate: Boolean(p.certificate),
      salary: Boolean(p.salary),
      currency: p.currency,
      amount: p.salary_amount,
      payment_type: p.payment_type,
    },
    is_open_hiring: Boolean(p.is_open_hiring),
    ...(rel.is_wished === undefined ? {} : { is_wished: rel.is_wished }),
    start_time: iso(p.start_time),
    finish_time: iso(p.finish_time),
    created_at: iso(p.created_at),
    user: rel.user,
    ...(rel.skills ? { skills: rel.skills } : {}),
    ...(rel.requirements ? { requirements: rel.requirements } : {}),
    ...(rel.team === undefined ? {} : { team: rel.team }),
    ...(rel.review === undefined
      ? {}
      : {
          review: rel.review
            ? {
                uuid: rel.review.id,
                overall_score: rel.review.overall_score,
                overall_review: rel.review.overall_review,
                project_result: rel.review.project_result,
              }
            : null,
        }),
  };
}
