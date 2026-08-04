import type {
  BoardKey,
  HomePayload,
  LeaderboardEntry,
  Paginated,
  ProfilePayload,
  Project,
  User,
  UserSummary,
} from "@/lib/types";

/**
 * Stand-in data for when the API cannot be reached.
 *
 * It exists so a deployment without a backend is still browsable rather than a wall of
 * 500s. It is shaped by hand against `types.ts` rather than captured from a live
 * response, so treat a mismatch here as a signal the types drifted.
 *
 * Everything is deterministic — no random values, no `Date.now()` — so the same page
 * renders identically on the server and on the client and hydration stays quiet.
 */

const DEMO_EPOCH = "2026-05-04T09:00:00.000000Z";

function summary(
  tagname: string,
  first: string,
  last: string,
  expertise: UserSummary["expertise"],
  finished: number,
): UserSummary {
  return {
    uuid: `demo-user-${tagname}`,
    tagname,
    first_name: first,
    last_name: last,
    name: `${first} ${last}`,
    role: "Student",
    photo_url: null,
    expertise,
    finished_project_count: finished,
  };
}

const students: UserSummary[] = [
  summary("ranti", "Ranti", "Prameswari", "UI/UX Designer", 7),
  summary("gilang", "Gilang", "Nurwahid", "Frontend Engineer", 5),
  summary("safira", "Safira", "Andini", "Backend Engineer", 6),
  summary("bagas", "Bagas", "Herlambang", "Data Expert", 3),
];

const lecturer: UserSummary = {
  uuid: "demo-user-wijaya",
  tagname: "wijaya",
  first_name: "Dr. Adi",
  last_name: "Wijaya",
  name: "Dr. Adi Wijaya",
  role: "Lecturer",
  photo_url: null,
  expertise: null,
};

function project(
  slug: string,
  title: string,
  description: string,
  status: Project["status"],
  lookingFor: Project["looking_for"],
  skills: string[],
): Project {
  return {
    uuid: `demo-project-${slug}`,
    title,
    description,
    project_url: slug,
    status,
    thumbnail: null,
    applicant_type: "Individual & Team",
    max_person: "4",
    level_applicant: "Intermediate",
    looking_for: lookingFor,
    reward: {
      certificate: true,
      salary: true,
      currency: "IDR",
      amount: "3500000",
      payment_type: "Per Project",
    },
    is_open_hiring: status === "Hiring",
    start_time: "2026-06-01",
    finish_time: "2026-08-30",
    created_at: DEMO_EPOCH,
    user: lecturer,
    skills,
    requirements: [
      "Available for weekly check-ins over the project period.",
      "Comfortable working in a small cross-discipline team.",
    ],
  };
}

const projects: Project[] = [
  project(
    "campus-wayfinding-app",
    "Campus wayfinding app for new students",
    "First-year students lose a lot of time finding rooms across the faculty buildings. We want a mobile-first guide with indoor floor plans, class schedules and a simple search.",
    "Hiring",
    ["UI/UX Designer", "Frontend Engineer"],
    ["Figma", "React Native", "Design systems"],
  ),
  project(
    "thesis-archive-search",
    "Searchable archive for undergraduate theses",
    "Ten years of theses sit in PDFs nobody can search. Build an ingest pipeline and a search interface so students can find prior work before proposing a topic.",
    "Hiring",
    ["Backend Engineer", "Data Expert"],
    ["Laravel", "PostgreSQL", "Full-text search"],
  ),
  project(
    "lab-equipment-booking",
    "Lab equipment booking and handover log",
    "Equipment is booked on paper and goes missing. We need a booking calendar with a handover record and reminders before a return is due.",
    "Ongoing",
    ["Frontend Engineer", "Backend Engineer"],
    ["Vue", "REST APIs", "Scheduling"],
  ),
  project(
    "attendance-insight-dashboard",
    "Attendance insight dashboard for lecturers",
    "Turn raw attendance exports into something a lecturer can act on mid-semester, highlighting students whose attendance is trending down.",
    "Finished",
    ["Data Expert", "UI/UX Designer"],
    ["Python", "Data visualisation", "Dashboards"],
  ),
];

const boardOrder: { key: BoardKey; expertise: LeaderboardEntry["expertise"] }[] = [
  { key: "ui_ux_designer", expertise: "UI/UX Designer" },
  { key: "front_end_engineer", expertise: "Frontend Engineer" },
  { key: "back_end_engineer", expertise: "Backend Engineer" },
  { key: "data_expert", expertise: "Data Expert" },
];

function boardEntries(index: number): LeaderboardEntry[] {
  const { expertise } = boardOrder[index];
  const basePoints = [12_400, 9_100, 7_800, 5_200][index];

  return students.map((student, rank) => ({
    uuid: `demo-board-${index}-${rank}`,
    expertise,
    points: Math.max(basePoints - rank * 1_450, 250),
    user: { ...student, expertise },
  }));
}

export function demoHome(): HomePayload {
  const top_boards = {} as HomePayload["top_boards"];

  boardOrder.forEach(({ key }, index) => {
    top_boards[key] = boardEntries(index)[0];
  });

  return {
    stats: { hiring: 2, ongoing: 1, finished: 1 },
    top_boards,
    latest_projects: projects.slice(0, 3),
  };
}

export function demoProjects(page = 1): Paginated<Project> {
  return {
    data: projects,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: 1,
      to: projects.length,
      per_page: 12,
      path: "/projects",
    },
  };
}

export function demoProject(projectUrl: string): Project {
  return projects.find((item) => item.project_url === projectUrl) ?? projects[0];
}

export function demoSimilarProjects(projectUrl: string): Project[] {
  return projects.filter((item) => item.project_url !== projectUrl).slice(0, 3);
}

export function demoLeaderboards(): { boards: Record<BoardKey, LeaderboardEntry[]> } {
  const boards = {} as Record<BoardKey, LeaderboardEntry[]>;

  boardOrder.forEach(({ key }, index) => {
    boards[key] = boardEntries(index);
  });

  return { boards };
}

export function demoProfile(tagname: string): ProfilePayload {
  const match = students.find((student) => student.tagname === tagname) ?? students[0];
  const points = 9_100;

  const user: User = {
    ...match,
    email: `${match.tagname}@demo.phive.test`,
    email_verified: true,
    identity_number: null,
    university: "Universitas Brawijaya",
    faculty: "Filkom",
    major: "Informatics Engineering",
    location: "Malang, Indonesia",
    biography:
      "Demo profile. The API was unreachable, so PHive is showing sample data in place of a real account.",
    is_open_hired: true,
    cv_url: null,
    links: {
      behance: null,
      github: "https://github.com",
      linkedin: null,
      dribbble: null,
      website: null,
    },
    skills: ["Figma", "Prototyping", "User research"],
    experiences: [],
    leaderboards: match.expertise
      ? [{ uuid: `demo-standing-${match.tagname}`, expertise: match.expertise, points }]
      : [],
    points,
    level: "Superior",
    created_at: DEMO_EPOCH,
  };

  return { user, projects: projects.slice(0, 2) };
}
