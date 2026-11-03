/**
 * The demo dataset (backend/database/seeders), as plain SQL statements so one source
 * feeds both the nightly reset in the Worker and `pnpm db:seed:*` (via
 * scripts/demo-sql.ts, which writes seed/demo.sql).
 *
 * Laravel drew from Faker on every run. This uses a fixed-seed generator and
 * hand-written content, so the demo looks the same after every reset and reads like
 * real projects rather than lorem ipsum.
 *
 * Accounts (password "password" for all): admin@phive.test (admin),
 * lecturer@phive.test, student@phive.test, plus 4 lecturers and 20 students.
 */
import { hashPassword } from "../lib/crypto.ts";
import { uuid7 } from "../lib/uuid.ts";

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXPERTISE = ["UI/UX Designer", "Frontend Engineer", "Backend Engineer", "Data Expert"];
const LEVELS = ["Easy", "Medium", "Hard", "Expert"];
const SKILLS = ["Vue", "React", "Laravel", "Figma", "Postgres", "Python"];

const FIRST = ["Ayu", "Budi", "Citra", "Dimas", "Eka", "Fajar", "Gita", "Hana", "Indra", "Joko", "Kirana", "Lukman", "Maya", "Nanda", "Oki", "Putri", "Raka", "Sari", "Tegar", "Umi", "Vina", "Wahyu", "Yusuf", "Zahra"];
const LAST = ["Lestari", "Santoso", "Wijaya", "Pratama", "Saputra", "Hidayat", "Kusuma", "Nugroho", "Rahmawati", "Siregar", "Utami", "Wibowo"];
const CITIES = ["Surabaya", "Malang", "Bandung", "Yogyakarta", "Semarang", "Jakarta", "Depok", "Denpasar"];
const UNIVERSITIES = ["Brawijaya University", "Airlangga University", "Gadjah Mada University", "Diponegoro University", "Udayana University"];

const PROJECTS: Array<[string, string]> = [
  ["Campus Wayfinding App", "A mobile map that routes students between lecture halls, labs and offices, including indoor floors and accessible entrances."],
  ["Library Seat Booking", "Let students reserve study seats and discussion rooms in the central library, with check-in by QR code and automatic release of no-shows."],
  ["Lab Equipment Tracker", "Track who borrowed which oscilloscope, microscope or Raspberry Pi, when it is due back and what condition it came back in."],
  ["Alumni Mentoring Portal", "Match final-year students with alumni mentors by field and city, and schedule short video calls between them."],
  ["Canteen Pre-Order System", "Order lunch from campus canteens ahead of time and pick it up without queueing between classes."],
  ["Thesis Plagiarism Dashboard", "A dashboard for supervisors that summarises similarity reports across a cohort's thesis drafts."],
  ["Student Club Event Board", "One place for every student club to post events, collect RSVPs and share photos afterwards."],
  ["Course Feedback Analytics", "Turn end-of-semester survey answers into readable trends per course, lecturer and year."],
  ["Internship Logbook", "A daily logbook for internship students that supervisors can review and sign off weekly."],
  ["Campus Shuttle Live Map", "Show where the campus shuttles are in real time and estimate arrival at each stop."],
  ["Research Grant Tracker", "Help faculty track grant deadlines, budgets and reporting obligations in one shared workspace."],
  ["Lost and Found Board", "Report and search lost items across faculties, with photos and a claim process at the security post."],
  ["Dormitory Maintenance Requests", "Residents report broken fixtures with photos; the housing office assigns and tracks repairs."],
  ["Exam Room Allocation", "Assign exam rooms and invigilators automatically from the timetable and room capacities."],
  ["Volunteer Hours Ledger", "Record community-service hours, verified by partner organisations, for scholarship requirements."],
];

const REQUIREMENTS = [
  "Available for a weekly progress meeting",
  "Comfortable working with Git and pull requests",
  "Can commit around ten hours a week",
  "Shares work-in-progress early and often",
  "Writes short notes on decisions taken",
];

const q = (v: unknown): string =>
  v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : typeof v === "boolean" ? (v ? "1" : "0") : `'${String(v).replace(/'/g, "''")}'`;

function insert(table: string, row: Record<string, unknown>): string {
  const keys = Object.keys(row);
  return `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map((k) => q(row[k])).join(", ")});`;
}

/** Tables in an order that respects foreign keys when deleting children first. */
export const RESET_ORDER = [
  "inboxes", "message_bodies", "message_headers", "team_invitations", "project_invitations",
  "applicant_team_members", "team_applicants", "individual_applicants", "project_boxes",
  "project_team_members", "project_teams", "team_members", "teams", "wishlists",
  "project_reviews", "project_skills", "project_requirements", "projects", "leaderboards",
  "experiences", "user_skills", "social_accounts", "social_auth_codes", "personal_access_tokens",
  "password_reset_tokens", "rate_limits", "users",
];

export async function demoStatements(options: { adminEmail?: string; adminPassword?: string; now?: number } = {}): Promise<string[]> {
  const random = rng(20201);
  const pick = <T>(list: readonly T[]) => list[Math.floor(random() * list.length)]!;
  const sample = <T>(list: readonly T[], n: number) => [...list].sort(() => random() - 0.5).slice(0, n);
  const now = options.now ?? Date.now();
  const password = await hashPassword("password");
  const out: string[] = [];
  const usedTags = new Set<string>();

  const user = (fields: Record<string, unknown>) => {
    const id = uuid7();
    out.push(
      insert("users", {
        id,
        identity_number: String(Math.floor(1e9 + random() * 9e9)),
        university: pick(UNIVERSITIES),
        faculty: "Computer Science",
        major: "Informatics",
        location: pick(CITIES),
        biography: "Building things for campus life, one semester at a time.",
        is_open_hired: 0,
        is_admin: 0,
        password,
        email_verified_at: now,
        created_at: now,
        updated_at: now,
        ...fields,
      }),
    );
    return id;
  };
  const tag = (first: string, last: string) => {
    let t = `${first}${last}`.toLowerCase();
    while (usedTags.has(t)) t = `${first}${last}${Math.floor(random() * 99999)}`.toLowerCase();
    usedTags.add(t);
    return t;
  };

  usedTags.add("admin").add("lecturer").add("student");
  const adminPassword = options.adminPassword && options.adminPassword !== "password" ? await hashPassword(options.adminPassword) : password;
  user({ first_name: "PHive", last_name: "Admin", tagname: "admin", email: options.adminEmail || "admin@phive.test", role: "Lecturer", is_admin: 1, password: adminPassword, identity_number: null, university: null, faculty: null, major: null, location: null, biography: null });

  const lecturers = [user({ first_name: "Test", last_name: "Lecturer", tagname: "lecturer", email: "lecturer@phive.test", role: "Lecturer" })];
  for (let i = 0; i < 4; i++) {
    const [first, last] = [pick(FIRST), pick(LAST)];
    lecturers.push(user({ first_name: first, last_name: last, tagname: tag(first, last), email: `${first}.${last}${i}@campus.ac.id`.toLowerCase(), role: "Lecturer" }));
  }

  const students: Array<{ id: string; expertise: string }> = [
    { id: user({ first_name: "Test", last_name: "Student", tagname: "student", email: "student@phive.test", role: "Student", expertise: "Frontend Engineer" }), expertise: "Frontend Engineer" },
  ];
  for (let i = 0; i < 20; i++) {
    const [first, last] = [pick(FIRST), pick(LAST)];
    const expertise = pick(EXPERTISE);
    students.push({ id: user({ first_name: first, last_name: last, tagname: tag(first, last), email: `${first}.${last}${i}@example.com`.toLowerCase(), role: "Student", expertise }), expertise });
  }
  for (const s of students) {
    for (const name of sample(SKILLS, 3)) out.push(insert("user_skills", { id: uuid7(), user_id: s.id, name }));
    out.push(insert("leaderboards", { id: uuid7(), user_id: s.id, expertise: s.expertise, points: Math.floor(random() * 501) }));
  }

  PROJECTS.forEach(([title, description], i) => {
    const id = uuid7();
    const flags = EXPERTISE.map(() => random() < 0.5);
    if (!flags.some(Boolean)) flags[Math.floor(random() * 4)] = true;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const created = now - (PROJECTS.length - i) * 3_600_000;
    out.push(
      insert("projects", {
        id,
        user_id: pick(lecturers),
        title,
        description: `${description}\n\nYou will work with a small team and a lecturer who meets you weekly.\n\nThe project ends with a demo to the faculty and a certificate for everyone who finishes.`,
        status: "Hiring",
        applicant_type: "Individual & Team",
        max_person: String(2 + Math.floor(random() * 5)),
        level_applicant: pick(LEVELS),
        ui_ux_designer: flags[0],
        front_end_engineer: flags[1],
        back_end_engineer: flags[2],
        data_expert: flags[3],
        certificate: true,
        salary: random() < 0.5,
        is_open_hiring: true,
        currency: "IDR",
        salary_amount: String(500_000 + Math.floor(random() * 10) * 500_000),
        payment_type: "person",
        project_url: `${slug}-${Math.floor(random() * 36 ** 8).toString(36).padStart(8, "0")}`,
        created_at: created,
        updated_at: created,
      }),
    );
    for (const name of sample(SKILLS.slice(0, 5), 3)) out.push(insert("project_skills", { id: uuid7(), project_id: id, name }));
    for (const requirement of sample(REQUIREMENTS, 3)) out.push(insert("project_requirements", { id: uuid7(), project_id: id, requirement }));
  });

  return out;
}
