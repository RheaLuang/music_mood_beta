import type { Moment, RichNode } from "../types";
import { documentBlocks } from "./document";

export const highlightColors = [
  { name: "Sage", color: "#c3cdb8" },
  { name: "Rose", color: "#dfc0bc" },
  { name: "Sand", color: "#e3d3ae" },
  { name: "Mist", color: "#bbced4" },
  { name: "Lavender", color: "#ccc3d6" },
];

export function richDocument(moment: Moment): RichNode {
  if (moment.document) return moment.document;
  return {
    type: "doc",
    content: documentBlocks(moment).flatMap((block): RichNode[] => {
      if (block.type === "image")
        return [
          {
            type: "image",
            attrs: { src: block.src, alt: "A photograph from this moment" },
          },
        ];
      if (block.type === "sticker")
        return [
          { type: "paragraph", content: [{ type: "text", text: block.text }] },
        ];
      return block.text.split("\n").map((text) => {
        const at = block.highlight ? text.indexOf(block.highlight) : -1;
        const content: RichNode[] =
          at < 0
            ? text
              ? [{ type: "text", text }]
              : []
            : [
                ...(at ? [{ type: "text", text: text.slice(0, at) }] : []),
                {
                  type: "text",
                  text: block.highlight!,
                  marks: [{ type: "highlight", attrs: { color: "#e3d3ae" } }],
                },
                ...(at + block.highlight!.length < text.length
                  ? [
                      {
                        type: "text",
                        text: text.slice(at + block.highlight!.length),
                      },
                    ]
                  : []),
              ];
        return {
          type: "paragraph",
          content:
            block.style === "body"
              ? content
              : content.map((n) => ({
                  ...n,
                  marks: [...(n.marks || []), { type: "bold" }],
                })),
        };
      });
    }),
  };
}

export function withDocument(
  moment: Moment,
  document: RichNode,
  body: string,
): Moment {
  return {
    ...moment,
    document,
    body,
    blocks: undefined,
    photos: [],
    stickers: [],
    highlight: "",
    font: "sans",
  };
}
