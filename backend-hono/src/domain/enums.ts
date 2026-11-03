/** backend/app/Enums, as value lists and the helpers that hang off them. */

export const UserRole = { Student: "Student", Lecturer: "Lecturer" } as const;
export const USER_ROLES = Object.values(UserRole);

export const EXPERTISE = [
  "UI/UX Designer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Expert",
] as const;
export type Expertise = (typeof EXPERTISE)[number];

/** Expertise → the boolean column on `projects` that says a project wants it. */
export const EXPERTISE_COLUMN = {
  "UI/UX Designer": "ui_ux_designer",
  "Frontend Engineer": "front_end_engineer",
  "Backend Engineer": "back_end_engineer",
  "Data Expert": "data_expert",
} as const satisfies Record<Expertise, string>;

export const ProjectStatus = {
  Draft: "Draft",
  Hiring: "Hiring",
  Ongoing: "Ongoing",
  Finished: "Finished",
} as const;
export const PROJECT_STATUSES = Object.values(ProjectStatus);

export const ApplicantType = {
  Individual: "Individual",
  Team: "Team",
  IndividualAndTeam: "Individual & Team",
} as const;
export const APPLICANT_TYPES = Object.values(ApplicantType);

export const allowsIndividual = (type: string) => type !== ApplicantType.Team;
export const allowsTeam = (type: string) => type !== ApplicantType.Individual;

export const ApplicationStatus = {
  Applying: "Applying",
  Waiting: "Waiting",
  Fixed: "Fixed",
  Rejected: "Rejected",
} as const;

export const ProjectBoxStatus = {
  Draft: "Draft",
  Hiring: "Hiring",
  Waiting: "Waiting",
  Confirmation: "Confirmation",
  Accepted: "Accepted",
  Rejected: "Rejected",
  WaitingToStart: "Waiting to Start",
  ProjectStarted: "Project Started",
  Ongoing: "Ongoing",
  Finished: "Finished",
  BailOut: "Bail Out",
} as const;

export const InvitationStatus = {
  Pending: "Pending",
  Accepted: "Accepted",
  Rejected: "Rejected",
} as const;

export const InboxCategory = {
  Message: "Message",
  TeamInvitation: "Team Invitation",
  ProjectInvitation: "Project Invitation",
} as const;

export const PROJECT_LEVELS = ["Easy", "Medium", "Hard", "Expert"] as const;

/** Level::forPoints, boundaries pinned by ProfileStandingTest. */
export function levelForPoints(points: number): "Rookie" | "Amateur" | "Superior" | "Expert" {
  if (points < 2501) return "Rookie";
  if (points < 7501) return "Amateur";
  if (points < 15001) return "Superior";
  return "Expert";
}
