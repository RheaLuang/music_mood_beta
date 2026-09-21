import { describe, expect, it } from "vitest";
import { seedMoments, songs } from "../data/demo";
import { upsertMoment, validMoments } from "./moments";
describe("Moment invariants", () => {
  it("preserves the original soundtrack and captured timestamp on edit", () => {
    const data = seedMoments();
    const first = data[0];
    const edited = {
      ...first,
      song: songs[1],
      createdAt: new Date(0).toISOString(),
      body: "Changed diary",
      title: "",
    };
    const saved = upsertMoment(data, edited).find((m) => m.id === first.id)!;
    expect(saved.song).toEqual(first.song);
    expect(saved.createdAt).toBe(first.createdAt);
    expect(saved.body).toBe("Changed diary");
    expect(saved.title).toBe("");
    expect(upsertMoment(data, edited)).toHaveLength(18);
  });
  it("allows separate moments with the same song", () => {
    const first = seedMoments()[0];
    const result = upsertMoment([first], { ...first, id: "new-id" });
    expect(result).toHaveLength(2);
    expect(result[0].song).toEqual(result[1].song);
  });
  it("rejects malformed stored data and accepts an intentionally empty archive", () => {
    expect(validMoments([])).toBe(true);
    expect(validMoments([{ id: "bad" }])).toBe(false);
    expect(validMoments(seedMoments())).toBe(true);
  });
});
