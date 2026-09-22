export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  duration: number;
};
export type Mood = {
  level?: 1 | 2 | 3 | 4 | 5;
  emoji: string;
  label: string;
  color: string;
};
export type TextBlock = {
  id: string;
  type: "text";
  text: string;
  style: "heading" | "subheading" | "body";
  highlight?: string;
};
export type DiaryBlock =
  | TextBlock
  | { id: string; type: "image"; src: string }
  | { id: string; type: "sticker"; text: string };
export type Moment = {
  document?: RichNode;
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
  sleeveImage?: string;
  blocks?: DiaryBlock[];
  liked: boolean;
};
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};
