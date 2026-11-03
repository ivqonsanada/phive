/**
 * The Laravel schema (backend/database/migrations), ported to SQLite for D1.
 *
 * Table and column names match the Laravel ones. The one structural change: Laravel
 * keeps an auto-increment `id` plus a public `uuid`, while here the UUIDv7 is the
 * primary key. Only the UUID was ever exposed, so the API contract is unchanged.
 *
 * D1 enforces foreign keys, so the cascades below behave as they do on Postgres.
 */
import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

import { uuid7 } from "../lib/uuid";

const id = () => text("id").primaryKey().$defaultFn(uuid7);

const timestamp = (name: string) => integer(name, { mode: "timestamp_ms" });

const timestamps = {
  created_at: timestamp("created_at").$defaultFn(() => new Date()),
  updated_at: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date()),
};

const bool = (name: string) => integer(name, { mode: "boolean" });

const userRef = (name: string) =>
  text(name)
    .notNull()
    .references((): AnySQLiteColumn => users.id, { onDelete: "cascade" });

export const users = sqliteTable(
  "users",
  {
    id: id(),
    first_name: text("first_name").notNull(),
    last_name: text("last_name").notNull(),
    role: text("role").notNull(),
    tagname: text("tagname").unique(),
    identity_number: text("identity_number"),
    email: text("email").notNull().unique(),
    email_verified_at: timestamp("email_verified_at"),
    password: text("password"),
    photo_url: text("photo_url"),
    expertise: text("expertise"),
    university: text("university"),
    faculty: text("faculty"),
    major: text("major"),
    location: text("location"),
    biography: text("biography"),
    is_open_hired: bool("is_open_hired").notNull().default(false),
    behance: text("behance"),
    github: text("github"),
    linkedin: text("linkedin"),
    dribbble: text("dribbble"),
    website: text("website"),
    cv_url: text("cv_url"),
    is_admin: bool("is_admin").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("users_role_index").on(t.role), index("users_expertise_index").on(t.expertise)],
);

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  email: text("email").primaryKey(),
  token: text("token").notNull(),
  created_at: timestamp("created_at"),
});

/** Sanctum's table, minus the polymorphic owner: only users hold tokens here. */
export const personalAccessTokens = sqliteTable(
  "personal_access_tokens",
  {
    id: id(),
    user_id: userRef("user_id"),
    name: text("name").notNull(),
    /** SHA-256 of the plaintext, hex. The plaintext is only ever returned once. */
    token: text("token").notNull().unique(),
    last_used_at: timestamp("last_used_at"),
    expires_at: timestamp("expires_at"),
    ...timestamps,
  },
  (t) => [index("personal_access_tokens_user_id_index").on(t.user_id)],
);

/**
 * Single-use codes handed to the frontend at the end of a social sign-in. Laravel
 * cached `{user_id, token}`; here the token is minted at exchange time, so no
 * plaintext token is ever at rest, and D1's DELETE … RETURNING cannot be raced.
 */
export const socialAuthCodes = sqliteTable("social_auth_codes", {
  /** SHA-256 of the code. */
  code: text("code").primaryKey(),
  user_id: userRef("user_id"),
  provider: text("provider").notNull(),
  expires_at: timestamp("expires_at").notNull(),
});

/** Fixed-window counters for the throttle middleware and the login lockout. */
export const rateLimits = sqliteTable("rate_limits", {
  key: text("key").primaryKey(),
  hits: integer("hits").notNull(),
  /** Epoch milliseconds at which the window closes. */
  reset_at: integer("reset_at").notNull(),
});

export const userSkills = sqliteTable(
  "user_skills",
  {
    id: id(),
    user_id: userRef("user_id"),
    name: text("name").notNull(),
  },
  (t) => [unique().on(t.user_id, t.name)],
);

export const experiences = sqliteTable("experiences", {
  id: id(),
  user_id: userRef("user_id"),
  project_name: text("project_name").notNull(),
  project_role: text("project_role").notNull(),
  /** YYYY-MM-DD */
  start_date: text("start_date").notNull(),
  end_date: text("end_date"),
});

export const leaderboards = sqliteTable(
  "leaderboards",
  {
    id: id(),
    user_id: userRef("user_id"),
    expertise: text("expertise").notNull(),
    points: integer("points").notNull().default(0),
  },
  (t) => [
    unique().on(t.user_id, t.expertise),
    index("leaderboards_expertise_points_index").on(t.expertise, t.points),
  ],
);

export const projects = sqliteTable(
  "projects",
  {
    id: id(),
    user_id: userRef("user_id"),
    title: text("title"),
    description: text("description"),
    status: text("status").notNull().default("Draft"),
    applicant_type: text("applicant_type").notNull().default("Individual & Team"),
    max_person: text("max_person").notNull().default("Not Specified"),
    thumbnail: text("thumbnail"),
    level_applicant: text("level_applicant"),
    ui_ux_designer: bool("ui_ux_designer").notNull().default(false),
    front_end_engineer: bool("front_end_engineer").notNull().default(false),
    back_end_engineer: bool("back_end_engineer").notNull().default(false),
    data_expert: bool("data_expert").notNull().default(false),
    certificate: bool("certificate").notNull().default(false),
    salary: bool("salary").notNull().default(false),
    is_open_hiring: bool("is_open_hiring").notNull().default(true),
    currency: text("currency").notNull().default("IDR"),
    salary_amount: text("salary_amount").notNull().default("0"),
    payment_type: text("payment_type").notNull().default("person"),
    project_url: text("project_url").unique(),
    start_time: timestamp("start_time"),
    finish_time: timestamp("finish_time"),
    ...timestamps,
  },
  (t) => [index("projects_status_index").on(t.status)],
);

const projectRef = (name = "project_id") =>
  text(name)
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" });

export const projectRequirements = sqliteTable("project_requirements", {
  id: id(),
  project_id: projectRef(),
  requirement: text("requirement").notNull(),
});

export const projectSkills = sqliteTable(
  "project_skills",
  {
    id: id(),
    project_id: projectRef(),
    name: text("name").notNull(),
  },
  (t) => [unique().on(t.project_id, t.name)],
);

export const projectReviews = sqliteTable("project_reviews", {
  id: id(),
  project_id: projectRef(),
  overall_score: text("overall_score"),
  overall_review: text("overall_review"),
  project_result: text("project_result"),
});

export const wishlists = sqliteTable(
  "wishlists",
  {
    id: id(),
    user_id: userRef("user_id"),
    project_id: projectRef(),
    status: bool("status").notNull().default(true),
    ...timestamps,
  },
  (t) => [unique().on(t.user_id, t.project_id)],
);

/** A "party": the standing team a student leads before applying to a project. */
export const teams = sqliteTable("teams", {
  id: id(),
  leader_id: userRef("leader_id"),
});

export const teamMembers = sqliteTable(
  "team_members",
  {
    id: id(),
    team_id: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    member_id: userRef("member_id"),
    expertise: text("expertise"),
  },
  (t) => [unique().on(t.team_id, t.member_id)],
);

/** The team that actually got hired onto a project. */
export const projectTeams = sqliteTable("project_teams", {
  id: id(),
  project_id: projectRef(),
  leader_id: text("leader_id").references(() => users.id, { onDelete: "set null" }),
});

export const projectTeamMembers = sqliteTable(
  "project_team_members",
  {
    id: id(),
    project_team_id: text("project_team_id")
      .notNull()
      .references(() => projectTeams.id, { onDelete: "cascade" }),
    member_id: userRef("member_id"),
    expertise: text("expertise"),
    assessment: text("assessment"),
    score: text("score"),
  },
  (t) => [unique().on(t.project_team_id, t.member_id)],
);

export const individualApplicants = sqliteTable(
  "individual_applicants",
  {
    id: id(),
    project_id: projectRef(),
    from_id: userRef("from_id"),
    to_id: userRef("to_id"),
    expertise: text("expertise").notNull(),
    status: text("status").notNull().default("Applying"),
    self_describe: text("self_describe"),
    apply_reason: text("apply_reason"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.project_id, t.from_id, t.to_id),
    index("individual_applicants_status_index").on(t.status),
  ],
);

export const teamApplicants = sqliteTable(
  "team_applicants",
  {
    id: id(),
    project_id: projectRef(),
    from_id: userRef("from_id"),
    to_id: userRef("to_id"),
    status: text("status").notNull().default("Applying"),
    self_describe: text("self_describe"),
    apply_reason: text("apply_reason"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.project_id, t.from_id, t.to_id),
    index("team_applicants_status_index").on(t.status),
  ],
);

export const applicantTeamMembers = sqliteTable(
  "applicant_team_members",
  {
    id: id(),
    team_applicant_id: text("team_applicant_id")
      .notNull()
      .references(() => teamApplicants.id, { onDelete: "cascade" }),
    member_id: userRef("member_id"),
    expertise: text("expertise").notNull(),
  },
  (t) => [unique().on(t.team_applicant_id, t.member_id)],
);

export const projectBoxes = sqliteTable(
  "project_boxes",
  {
    id: id(),
    project_id: projectRef(),
    user_id: userRef("user_id"),
    status: text("status").notNull().default("Waiting"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.project_id, t.user_id),
    index("project_boxes_status_index").on(t.status),
  ],
);

export const projectInvitations = sqliteTable(
  "project_invitations",
  {
    id: id(),
    project_id: projectRef(),
    from_id: userRef("from_id"),
    to_id: userRef("to_id"),
    status: text("status").notNull().default("Pending"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.project_id, t.from_id, t.to_id),
    index("project_invitations_status_index").on(t.status),
  ],
);

export const teamInvitations = sqliteTable(
  "team_invitations",
  {
    id: id(),
    team_id: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    from_id: userRef("from_id"),
    to_id: userRef("to_id"),
    status: text("status").notNull().default("Pending"),
    ...timestamps,
  },
  (t) => [
    unique().on(t.team_id, t.from_id, t.to_id),
    index("team_invitations_status_index").on(t.status),
  ],
);

/** One conversation per unordered pair of users. */
export const messageHeaders = sqliteTable(
  "message_headers",
  {
    id: id(),
    user_one_id: userRef("user_one_id"),
    user_two_id: userRef("user_two_id"),
  },
  (t) => [unique().on(t.user_one_id, t.user_two_id)],
);

export const messageBodies = sqliteTable(
  "message_bodies",
  {
    id: id(),
    message_header_id: text("message_header_id")
      .notNull()
      .references(() => messageHeaders.id, { onDelete: "cascade" }),
    sender_id: userRef("sender_id"),
    recipient_id: userRef("recipient_id"),
    message: text("message").notNull(),
    ...timestamps,
  },
  (t) => [index("message_bodies_header_created_index").on(t.message_header_id, t.created_at)],
);

export const inboxes = sqliteTable(
  "inboxes",
  {
    id: id(),
    recipient_id: userRef("recipient_id"),
    sender_id: userRef("sender_id"),
    team_invitation_id: text("team_invitation_id").references(() => teamInvitations.id, {
      onDelete: "cascade",
    }),
    project_invitation_id: text("project_invitation_id").references(
      () => projectInvitations.id,
      { onDelete: "cascade" },
    ),
    message_body_id: text("message_body_id").references(() => messageBodies.id, {
      onDelete: "cascade",
    }),
    category: text("category").notNull(),
    is_read: bool("is_read").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    index("inboxes_category_index").on(t.category),
    index("inboxes_recipient_read_index").on(t.recipient_id, t.is_read),
  ],
);

/**
 * A row per linked provider, so one account can sign in with Google and Apple both,
 * and unlinking one leaves the rest alone.
 */
export const socialAccounts = sqliteTable(
  "social_accounts",
  {
    id: id(),
    user_id: userRef("user_id"),
    provider: text("provider").notNull(),
    provider_id: text("provider_id").notNull(),
    avatar: text("avatar"),
    ...timestamps,
  },
  (t) => [unique().on(t.provider, t.provider_id), unique().on(t.user_id, t.provider)],
);

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
