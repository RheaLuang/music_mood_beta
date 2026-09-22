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
  { level: 1, emoji: "😄", label: "很开心", color: "#d3a456" },
  { level: 2, emoji: "🙂", label: "开心", color: "#c7b878" },
  { level: 3, emoji: "😐", label: "平静", color: "#a9b6a2" },
  { level: 4, emoji: "🙁", label: "低落", color: "#91a8b1" },
  { level: 5, emoji: "😞", label: "很难过", color: "#8391a7" },
];
const legacyFragments = [
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
const fragments = [
  [
    "绕远一点回家",
    "我故意坐过了一站。水面还留着一点光，这首歌让整辆公交车像一个只属于自己的房间。\n\n原来偶尔迟到，也像是把什么东西找了回来。",
  ],
  [
    "",
    "看着厨房窗外的树，咖啡不知不觉凉了。今天没发生什么特别的事。想了想，这也许正是我需要的一天。",
  ],
  [
    "春天快到了",
    "今早的空气有一点不一样。我敞着外套，打给了一个念叨了很久却一直没联系的朋友。\n\n有些开始，真的很轻。",
  ],
  [
    "两个人的一张桌",
    "我们坐到店员开始收椅子。已经记不清聊了什么，只记得，那天我一次也没有看手机。",
  ],
  [
    "在离开之前",
    "地上放着收拾到一半的行李，耳边是几年前听过的歌。明明期待着出发，今晚却已经开始想念这里。",
  ],
  [
    "",
    "摘下耳机走了一会儿，到桥边才又放起这首歌。像是整座城市，都在等这一段副歌。",
  ],
  [
    "把这种感觉留下",
    "下午好像变得很长。我们买了桃子，坐在台阶上，什么计划也没有。想记住这种轻松。",
  ],
  [
    "温柔一点的一天",
    "做的事比计划少一些，但还是认真做了晚饭。打开窗，让一首好听的歌，也算今天的一件好事。",
  ],
];
export function localizeStoredMoment(m: Moment): Moment {
  let next = m;
  if (m.id.startsWith("demo-")) {
    const i = legacyFragments.findIndex(([, body]) => body === m.body);
    if (i >= 0 && !m.blocks)
      next = {
        ...m,
        body: fragments[i][1],
        title: m.title === legacyFragments[i][0] ? fragments[i][0] : m.title,
        highlight: m.highlight ? "把什么东西找了回来" : "",
      };
  }
  if (next.mood && !next.mood.level) {
    const old: Record<string, number> = {
      Calm: 2,
      Nostalgic: 3,
      Warm: 1,
      Melancholy: 4,
      Hopeful: 1,
      Restless: 3,
      Overwhelmed: 4,
    };
    const idx = old[next.mood.label];
    next = {
      ...next,
      mood: {
        ...moods[idx ?? 2],
        label: idx === undefined ? next.mood.label : moods[idx].label,
      },
    };
  }
  return next;
}
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
      mood: i % 5 === 1 ? undefined : moods[i % 5],
      font: i % 3 === 0 ? "serif" : "sans",
      highlight: i % 4 === 0 ? "把什么东西找了回来" : "",
      photos: i % 6 === 0 ? ["artwork/sea.jpg"] : [],
      stickers: i % 4 === 0 ? ["✺"] : [],
      sleeve: i % 3 === 0 ? "paper" : i % 4 === 0 ? "ink" : "original",
      liked: i % 5 === 0,
    };
  });
}
