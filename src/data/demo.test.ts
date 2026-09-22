import { describe, expect, it } from "vitest";
import { ensureYearExamples, seedMoments } from "./demo";
describe("Full-year demo archive", () => {
  it("fills all twelve months with at least four real, openable moments", () => {
    const now = new Date(2026, 8, 22);
    const existing = seedMoments(now);
    const filled = ensureYearExamples(existing, now);
    for (let month = 0; month < 12; month++) {
      expect(
        filled.filter(
          (m) =>
            new Date(m.createdAt).getFullYear() === 2026 &&
            new Date(m.createdAt).getMonth() === month,
        ).length,
      ).toBeGreaterThanOrEqual(4);
    }
    existing.forEach((m) =>
      expect(filled.find((x) => x.id === m.id)).toEqual(m),
    );
    expect(ensureYearExamples(filled, now)).toEqual(filled);
    expect(new Set(filled.map((m) => m.id)).size).toBe(filled.length);
  });
  it("does not repopulate an empty archive or overwrite personal diaries", () => {
    expect(ensureYearExamples([])).toEqual([]);
    const personal = {
      ...seedMoments()[0],
      id: "personal",
      title: "My own words",
    };
    expect(ensureYearExamples([personal])).toEqual([personal]);
  });
});
