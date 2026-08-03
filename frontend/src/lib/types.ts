export type UserRole = "Student" | "Lecturer";

export type Expertise =
  | "UI/UX Designer"
  | "Frontend Engineer"
  | "Backend Engineer"
  | "Data Expert";

export interface User {
  id: number;
  tagname: string;
  first_name: string;
  last_name: string;
  name: string;
  role: UserRole;
  email: string;
  email_verified: boolean;
  identity_number: string | null;
  photo_url: string | null;
  expertise: Expertise | null;
  university: string | null;
  faculty: string | null;
  major: string | null;
  location: string | null;
  biography: string | null;
  is_open_hired: boolean;
  cv_url: string | null;
  links: {
    behance: string | null;
    github: string | null;
    linkedin: string | null;
    dribbble: string | null;
    website: string | null;
  };
  skills?: string[];
  unread_inbox_count?: number;
  created_at: string;
}

export interface AuthPayload {
  user: User;
  token: string;
}

/** The compact user card embedded in projects and leaderboard rows. */
export interface UserSummary {
  id: number;
  tagname: string;
  first_name: string;
  last_name: string;
  name: string;
  role: UserRole;
  photo_url: string | null;
  expertise: Expertise | null;
  finished_project_count?: number;
}

export type ProjectStatus = "Draft" | "Hiring" | "Ongoing" | "Finished";
export type ApplicantType = "Individual" | "Team" | "Individual & Team";

export interface Project {
  id: number;
  title: string | null;
  description: string | null;
  project_url: string | null;
  status: ProjectStatus;
  thumbnail: string | null;
  applicant_type: ApplicantType;
  max_person: string;
  level_applicant: string | null;
  looking_for: Expertise[];
  reward: {
    certificate: boolean;
    salary: boolean;
    currency: string;
    amount: string;
    payment_type: string;
  };
  is_open_hiring: boolean;
  /** Absent for guests — only selected when the request carried a token. */
  is_wished?: boolean;
  start_time: string | null;
  finish_time: string | null;
  created_at: string;
  user?: UserSummary;
  skills?: string[];
  requirements?: string[];
  team?: ProjectTeam;
  review?: ProjectReview | null;
}

export interface ProjectTeam {
  id: number;
  leader?: UserSummary;
  members?: {
    expertise: Expertise | null;
    score: string | null;
    assessment: string | null;
    user?: UserSummary;
  }[];
}

export interface ProjectReview {
  overall_score: string | null;
  overall_review: string | null;
  project_result: string | null;
}

export interface LeaderboardEntry {
  id: number;
  expertise: Expertise;
  points: number;
  user?: UserSummary;
}

/** The four expertise boards, keyed by the API's column-style slugs. */
export type BoardKey =
  | "ui_ux_designer"
  | "front_end_engineer"
  | "back_end_engineer"
  | "data_expert";

export interface HomePayload {
  stats: { hiring: number; ongoing: number; finished: number };
  top_boards: Record<BoardKey, LeaderboardEntry | null>;
  latest_projects: Project[];
}

export interface ProfilePayload {
  user: User;
  projects: Project[];
}

/** Laravel's `simplePaginate` envelope, as rendered by a resource collection. */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    to: number | null;
    per_page: number;
    path: string;
  };
}

/** Laravel's 422 response shape. */
export type ValidationErrors = Record<string, string[]>;

/** What every auth server action hands back to its form. */
export interface FormState {
  message?: string;
  errors?: ValidationErrors;
  /** Set when the action succeeded but does not redirect (e.g. "check your email"). */
  success?: string;
}
