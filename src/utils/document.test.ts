import { describe, expect, it } from "vitest";
import {
  documentBlocks,
  insertBlock,
  splitTextBlock,
  textBlock,
  withBlocks,
} from "./document";
import { seedMoments, moods, localizeStoredMoment } from "../data/demo";
import { validMoments, upsertMoment } from "../store/moments";
describe("Continuous diary", () => {
  it("inserts images between text and retains content on both sides", () => {
    const text = textBlock("图片前图片后");
    const next = insertBlock([text], text.id, 3, {
      id: "photo",
      type: "image",
      src: "data:image/jpeg;base64,AA",
    });
    expect(next.map((b) => b.type)).toEqual(["text", "image", "text"]);
    expect(next[0]).toMatchObject({ text: "图片前" });
    expect(next[2]).toMatchObject({ text: "图片后", style: "body" });
    const saved = withBlocks(seedMoments()[0], next);
    expect(validMoments([JSON.parse(JSON.stringify(saved))])).toBe(true);
    expect(documentBlocks(saved)).toEqual(next);
  });
  it("keeps a heading and continues in body style after Enter", () => {
    const text = { ...textBlock("标题正文"), style: "heading" as const };
    const result = splitTextBlock([text], text.id, 2);
    expect(result[0]).toMatchObject({ text: "标题", style: "heading" });
    expect(result[1]).toMatchObject({ text: "正文", style: "body" });
  });
  it("does not copy a highlight into an empty continuation", () => {
    const text = { ...textBlock("今天很好"), highlight: "今天很好" };
    const result = insertBlock([text], text.id, 4, {
      id: "image",
      type: "image",
      src: "photo.jpg",
    });
    expect(result[0]).toMatchObject({ highlight: "今天很好" });
    expect(result[2]).toMatchObject({ text: "", highlight: undefined });
  });
  it("migrates legacy images and stickers into readable order without losing text", () => {
    const m = seedMoments()[0];
    const blocks = documentBlocks(m);
    expect(blocks[0]).toMatchObject({ text: m.body, highlight: m.highlight });
    expect(blocks.some((b) => b.type === "image")).toBe(true);
    expect(blocks[blocks.length - 1].type).toBe("text");
    expect(
      localizeStoredMoment({ ...m, id: "user-note", body: "My own words" })
        .body,
    ).toBe("My own words");
  });
  it("persists every mood level, custom text, and sleeve without changing the song", () => {
    const original = seedMoments()[0];
    for (const mood of moods) {
      const draft = {
        ...original,
        mood: { ...mood, label: "累但开心" },
        sleeveImage: "data:image/jpeg;base64,AA",
      };
      const saved = upsertMoment([original], draft)[0];
      expect(validMoments([saved])).toBe(true);
      expect(saved.mood?.label).toBe("累但开心");
      expect(saved.song.artwork).toBe(original.song.artwork);
    }
  });
});
