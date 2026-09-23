import { describe, expect, it } from "vitest";
import { seedMoments, songs } from "../data/demo";
import { upsertMoment, validMoments, removeMoments } from "./moments";
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

it("removes only selected IDs, preserves same-song records, and persists an empty archive", () => {
  const source = seedMoments();
  const ids = [source[0].id, source[2].id];
  const remaining = removeMoments(source, ids);
  expect(remaining).toEqual(source.filter(m => !ids.includes(m.id)));
  expect(source).toHaveLength(18);
  expect(validMoments(JSON.parse(JSON.stringify(remaining)))).toBe(true);
  expect(removeMoments(source, source.map(m => m.id))).toEqual([]);
});
