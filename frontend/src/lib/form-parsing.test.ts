import { describe, expect, it } from "vitest";

import { parseLines, parseReviewParticipants, parseTeamApplicants } from "@/lib/form-parsing";

function form(entries: [string, string][]): FormData {
  const data = new FormData();
  for (const [key, value] of entries) {
    data.append(key, value);
  }
  return data;
}

const UUID = "019fc9ee-713e-7071-9b91-4b0c3ad877f5";
const OTHER = "019fc9ee-714a-7194-833a-65a8864795ef";

describe("parseTeamApplicants", () => {
  it("collects one applicant per filled expertise select", () => {
    expect(
      parseTeamApplicants(
        form([
          [`expertise[${UUID}]`, "Frontend Engineer"],
          [`expertise[${OTHER}]`, "Data Expert"],
        ]),
      ),
    ).toEqual([
      { member_uuid: UUID, expertise: "Frontend Engineer" },
      { member_uuid: OTHER, expertise: "Data Expert" },
    ]);
  });

  it("skips members left on 'Not applying'", () => {
    // Nobody should be conscripted into an application they opted out of.
    const result = parseTeamApplicants(
      form([
        [`expertise[${UUID}]`, ""],
        [`expertise[${OTHER}]`, "Backend Engineer"],
      ]),
    );

    expect(result).toEqual([{ member_uuid: OTHER, expertise: "Backend Engineer" }]);
  });

  it("ignores the other fields on the form", () => {
    expect(
      parseTeamApplicants(
        form([
          ["self_describe", "We are a team"],
          ["apply_reason", "expertise[not-a-field]"],
          [`expertise[${UUID}]`, "Data Expert"],
        ]),
      ),
    ).toEqual([{ member_uuid: UUID, expertise: "Data Expert" }]);
  });

  it("returns nothing when no one is selected", () => {
    expect(parseTeamApplicants(form([["self_describe", "hi"]]))).toEqual([]);
  });
});

describe("parseReviewParticipants", () => {
  it("regroups fields scattered across the form by member", () => {
    expect(
      parseReviewParticipants(
        form([
          [`participants[${UUID}][expertise]`, "Frontend Engineer"],
          [`participants[${OTHER}][expertise]`, "Data Expert"],
          [`participants[${UUID}][score]`, "4"],
          [`participants[${OTHER}][score]`, "5"],
          [`participants[${UUID}][assessment]`, "Strong work."],
        ]),
      ),
    ).toEqual([
      { member_uuid: UUID, expertise: "Frontend Engineer", score: "4", assessment: "Strong work." },
      { member_uuid: OTHER, expertise: "Data Expert", score: "5", assessment: null },
    ]);
  });

  it("treats an empty assessment as nothing rather than an empty string", () => {
    const [participant] = parseReviewParticipants(
      form([
        [`participants[${UUID}][expertise]`, "Data Expert"],
        [`participants[${UUID}][score]`, "3"],
        [`participants[${UUID}][assessment]`, ""],
      ]),
    );

    expect(participant.assessment).toBeNull();
  });

  it("ignores the overall review fields", () => {
    const result = parseReviewParticipants(
      form([
        ["overall_score", "5"],
        ["overall_review", "Went well"],
        [`participants[${UUID}][expertise]`, "Data Expert"],
        [`participants[${UUID}][score]`, "5"],
      ]),
    );

    expect(result).toHaveLength(1);
    expect(result[0].member_uuid).toBe(UUID);
  });
});

describe("parseLines", () => {
  it("splits, trims and drops blanks", () => {
    expect(parseLines("React\n  Figma  \n\n\nLaravel\n")).toEqual(["React", "Figma", "Laravel"]);
  });

  it("handles an empty or missing value", () => {
    expect(parseLines("")).toEqual([]);
    expect(parseLines(null)).toEqual([]);
  });
});
