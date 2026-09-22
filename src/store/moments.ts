import type { DiaryBlock, Moment, Song } from "../types";
export const STORAGE_KEY = "rambling.moments.v1";
export function createMoment(song: Song): Moment {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    song: { ...song },
    title: "",
    body: "",
    font: "serif",
    highlight: "",
    photos: [],
    stickers: [],
    sleeve: "original",
    liked: false,
  };
}
export function upsertMoment(items: Moment[], draft: Moment): Moment[] {
  const original = items.find((x) => x.id === draft.id);
  const saved = original
    ? { ...draft, song: original.song, createdAt: original.createdAt }
    : draft;
  return [saved, ...items.filter((x) => x.id !== saved.id)].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
function validBlock(value: unknown): value is DiaryBlock {
  if (!value || typeof value !== "object") return false;
  const block = value as Record<string, unknown>;
  if (typeof block.id !== "string") return false;
  if (block.type === "image") return typeof block.src === "string";
  if (block.type === "sticker") return typeof block.text === "string";
  return (
    block.type === "text" &&
    typeof block.text === "string" &&
    ["heading", "subheading", "body"].includes(String(block.style)) &&
    (block.highlight === undefined || typeof block.highlight === "string")
  );
}
function validDocument(value: unknown, depth = 0): boolean {
  if (!value || typeof value !== "object" || depth > 40) return false;
  const node = value as Record<string, unknown>;
  return (
    typeof node.type === "string" &&
    [
      "doc",
      "paragraph",
      "text",
      "hardBreak",
      "image",
      "bulletList",
      "orderedList",
      "listItem",
      "blockquote",
    ].includes(node.type) &&
    (node.type !== "text" || typeof node.text === "string") &&
    (node.attrs === undefined ||
      (node.attrs !== null && typeof node.attrs === "object")) &&
    (node.marks === undefined ||
      (Array.isArray(node.marks) &&
        node.marks.every((mark) => mark && typeof mark.type === "string"))) &&
    (node.content === undefined ||
      (Array.isArray(node.content) &&
        node.content.every((child) => validDocument(child, depth + 1))))
  );
}
export function validMoments(value: unknown): value is Moment[] {
  return (
    Array.isArray(value) &&
    value.every(
      (m) =>
        m &&
        typeof m.id === "string" &&
        typeof m.createdAt === "string" &&
        !isNaN(Date.parse(m.createdAt)) &&
        typeof m.song?.id === "string" &&
        typeof m.song.artwork === "string" &&
        typeof m.body === "string" &&
        (m.document === undefined ||
          (m.document?.type === "doc" && validDocument(m.document))) &&
        typeof m.title === "string" &&
        typeof m.highlight === "string" &&
        ["serif", "sans", "hand"].includes(m.font) &&
        ["original", "paper", "ink"].includes(m.sleeve) &&
        (m.sleeveImage === undefined || typeof m.sleeveImage === "string") &&
        (m.blocks === undefined ||
          (Array.isArray(m.blocks) && m.blocks.every(validBlock))) &&
        Array.isArray(m.photos) &&
        m.photos.every((p: unknown) => typeof p === "string") &&
        Array.isArray(m.stickers) &&
        m.stickers.every((p: unknown) => typeof p === "string") &&
        (!m.mood ||
          (typeof m.mood.label === "string" &&
            typeof m.mood.emoji === "string" &&
            typeof m.mood.color === "string" &&
            (m.mood.level === undefined ||
              [1, 2, 3, 4, 5].includes(m.mood.level)))),
    )
  );
}
