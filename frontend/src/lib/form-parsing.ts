import type { Expertise } from "@/lib/types";

/**
 * Form field names carry identifiers, which makes them easy to get subtly wrong —
 * these parsers were silently coupled to integer ids until UUIDs arrived. Keeping
 * them pure and separate from the server actions is what makes them testable.
 */

export interface TeamApplicant {
  member_uuid: string;
  expertise: Expertise;
}

/**
 * The team application form renders one `expertise[<uuid>]` select per party member.
 * A member left on "Not applying" submits an empty value and is skipped.
 */
export function parseTeamApplicants(formData: FormData): TeamApplicant[] {
  const members: TeamApplicant[] = [];

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^expertise\[([\w-]+)\]$/);

    if (match && typeof value === "string" && value) {
      members.push({ member_uuid: match[1], expertise: value as Expertise });
    }
  }

  return members;
}

export interface ReviewParticipant {
  member_uuid: string;
  expertise: string;
  score: string;
  assessment: string | null;
}

/**
 * The review form renders `participants[<uuid>][expertise|score|assessment]` per
 * person, so the fields for one participant arrive scattered through the FormData.
 */
export function parseReviewParticipants(formData: FormData): ReviewParticipant[] {
  const byMember: Record<string, Record<string, string>> = {};

  for (const [key, value] of formData.entries()) {
    const match = key.match(/^participants\[([\w-]+)]\[(\w+)]$/);

    if (match && typeof value === "string") {
      byMember[match[1]] ??= {};
      byMember[match[1]][match[2]] = value;
    }
  }

  return Object.entries(byMember).map(([uuid, fields]) => ({
    member_uuid: uuid,
    expertise: fields.expertise,
    score: fields.score,
    // An empty textarea means "nothing to say", not an empty string.
    assessment: fields.assessment || null,
  }));
}

/**
 * Textareas that stand in for a list — one item per line, blanks discarded.
 */
export function parseLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
