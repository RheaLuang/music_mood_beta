import type { Moment, Song } from "../types";
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
        typeof m.title === "string" &&
        typeof m.highlight === "string" &&
        ["serif", "sans", "hand"].includes(m.font) &&
        ["original", "paper", "ink"].includes(m.sleeve) &&
        Array.isArray(m.photos) &&
        m.photos.every((p: unknown) => typeof p === "string") &&
        Array.isArray(m.stickers) &&
        m.stickers.every((p: unknown) => typeof p === "string") &&
        (!m.mood ||
          (typeof m.mood.label === "string" &&
            typeof m.mood.emoji === "string" &&
            typeof m.mood.color === "string")),
    )
  );
}
