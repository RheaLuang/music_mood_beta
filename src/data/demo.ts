import type { Song, Mood, Moment } from "../types";
export const songs: Song[] = [
  {
    id: "s1",
    title: "Somewhere, Slowly",
    artist: "The Sunday Hours",
    album: "Places We Leave",
    artwork: "artwork/coast.jpg",
    duration: 224,
  },
  {
    id: "s2",
    title: "Window Seat",
    artist: "June & the River",
    album: "Small Hours",
    artwork: "artwork/forest.jpg",
    duration: 198,
  },
  {
    id: "s3",
    title: "After the Rain",
    artist: "Low Season",
    album: "Between Days",
    artwork: "artwork/mountain.jpg",
    duration: 246,
  },
  {
    id: "s4",
    title: "A Little Longer",
    artist: "Milo Green",
    album: "Soft Light",
    artwork: "artwork/sea.jpg",
    duration: 212,
  },
];
export const moods: Mood[] = [
  { emoji: "🫧", label: "Calm", color: "#a6bec5" },
  { emoji: "🌙", label: "Nostalgic", color: "#b7acc6" },
  { emoji: "☀️", label: "Warm", color: "#dfb364" },
  { emoji: "🌧", label: "Melancholy", color: "#a5adb5" },
  { emoji: "🌱", label: "Hopeful", color: "#b0bc92" },
  { emoji: "⚡", label: "Restless", color: "#d5a08b" },
  { emoji: "🫠", label: "Overwhelmed", color: "#c6a69d" },
];
const fragments = [
  [
    "The long way home",
    "I missed my stop on purpose. There was still a little light left on the water, and this song made the whole bus feel like a room of its own.\n\nFor once, being late felt like getting something back.",
  ],
  [
    "",
    "Coffee went cold while I watched the trees outside the kitchen window. Nothing much happened today. I think that was exactly what I needed.",
  ],
  [
    "Almost spring",
    "The air felt different this morning. I left my jacket open and called a friend I have been meaning to call for weeks.\n\nSome things begin very quietly.",
  ],
  [
    "A table for two",
    "We stayed until they started stacking the chairs. I cannot remember what we talked about, only that I did not look at my phone once.",
  ],
  [
    "Between things",
    "A half-packed bag on the floor. A song from another year. I am excited about leaving, but tonight I let myself miss this place before I go.",
  ],
  [
    "",
    "Walked without headphones for a while, then put this on at the bridge. It felt like the city had been waiting for the chorus.",
  ],
  [
    "Keep this feeling",
    "The afternoon stretched out in front of us. We bought peaches, sat on the steps, and made no plans at all. I want to remember how easy it was.",
  ],
  [
    "A softer day",
    "I did less than I planned. Made dinner anyway. Opened the window. Let a good song count as something good.",
  ],
];
export function seedMoments(now = new Date()): Moment[] {
  return Array.from({ length: 18 }, (_, i) => {
    const d = new Date(now);
    d.setDate(
      d.getDate() -
        [0, 1, 2, 3, 4, 5, 6, 9, 12, 17, 23, 32, 39, 48, 65, 86, 110, 145][i],
    );
    d.setHours(17 + (i % 5), 12 + i * 2, 0, 0);
    if (d > now) d.setTime(now.getTime() - 3600000);
    const [title, body] = fragments[i % 8];
    return {
      id: `demo-${i}`,
      createdAt: d.toISOString(),
      song: songs[i % 4],
      title,
      body,
      mood: i % 5 === 1 ? undefined : moods[i % 7],
      font: i % 3 === 0 ? "serif" : "sans",
      highlight:
        i % 4 === 0 ? "being late felt like getting something back" : "",
      photos: i % 6 === 0 ? ["artwork/sea.jpg"] : [],
      stickers: i % 4 === 0 ? ["✺"] : [],
      sleeve: i % 3 === 0 ? "paper" : i % 4 === 0 ? "ink" : "original",
      liked: i % 5 === 0,
    };
  });
}
