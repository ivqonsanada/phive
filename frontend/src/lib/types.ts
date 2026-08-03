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

/** Laravel's 422 response shape. */
export type ValidationErrors = Record<string, string[]>;

/** What every auth server action hands back to its form. */
export interface FormState {
  message?: string;
  errors?: ValidationErrors;
  /** Set when the action succeeded but does not redirect (e.g. "check your email"). */
  success?: string;
}
