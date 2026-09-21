export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
};
export type Mood = { emoji: string; label: string; color: string };
export type Moment = {
  id: string;
  readonly createdAt: string;
  readonly song: Song;
  title: string;
  body: string;
  mood?: Mood;
  font: "serif" | "sans" | "hand";
  highlight: string;
  photos: string[];
  stickers: string[];
  sleeve: "original" | "paper" | "ink";
  liked: boolean;
};
