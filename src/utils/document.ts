import type { DiaryBlock, Moment, TextBlock } from "../types";
export const textBlock = (text = ""): TextBlock => ({
  id: crypto.randomUUID(),
  type: "text",
  text,
  style: "body",
});
function sliceText(block: TextBlock, start: number, end?: number): TextBlock {
  const text = block.text.slice(start, end);
  return {
    ...block,
    text,
    highlight:
      block.highlight && text.includes(block.highlight)
        ? block.highlight
        : undefined,
  };
}
export function documentBlocks(m: Moment): DiaryBlock[] {
  if (m.blocks?.length) return m.blocks;
  const result: DiaryBlock[] = [
    { ...textBlock(m.body), highlight: m.highlight },
  ];
  m.photos.forEach((src) => {
    result.push({ id: crypto.randomUUID(), type: "image", src }, textBlock());
  });
  m.stickers.forEach((text) =>
    result.push({ id: crypto.randomUUID(), type: "sticker", text }),
  );
  if (result[result.length - 1]?.type !== "text") result.push(textBlock());
  return result;
}
// Insert media at the remembered cursor, keeping text on both sides editable.
export function insertBlock(
  blocks: DiaryBlock[],
  active: string,
  offset: number,
  media: DiaryBlock,
): DiaryBlock[] {
  const index = blocks.findIndex((b) => b.id === active && b.type === "text");
  if (index < 0) return [...blocks, media, textBlock()];
  const block = blocks[index] as TextBlock;
  const at = Math.max(0, Math.min(offset, block.text.length));
  return [
    ...blocks.slice(0, index),
    sliceText(block, 0, at),
    media,
    { ...sliceText(block, at), id: crypto.randomUUID(), style: "body" },
    ...blocks.slice(index + 1),
  ];
}
export function withBlocks(m: Moment, blocks: DiaryBlock[]): Moment {
  return {
    ...m,
    blocks,
    body: blocks
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n\n"),
    // Media lives in blocks; avoid serializing large data URLs twice.
    photos: [],
    stickers: [],
  };
}
export function splitTextBlock(
  blocks: DiaryBlock[],
  id: string,
  start: number,
  end = start,
): DiaryBlock[] {
  const index = blocks.findIndex((b) => b.id === id);
  const block = blocks[index];
  if (!block || block.type !== "text") return blocks;
  return [
    ...blocks.slice(0, index),
    sliceText(block, 0, start),
    { ...sliceText(block, end), id: crypto.randomUUID(), style: "body" },
    ...blocks.slice(index + 1),
  ];
}
