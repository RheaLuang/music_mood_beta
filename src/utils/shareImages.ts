import html2canvas from "html2canvas";
import { zipSync } from "fflate";
import { pageSlices, type AvoidBreak } from "./pagination";
export type ShareImage = { file: File; url: string };
const width = 390,
  height = 844,
  scale = 2,
  inset = 24;
const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Could not create this image.")),
      "image/png",
    ),
  );
async function ready(element: HTMLElement) {
  await document.fonts.ready;
  await Promise.all(
    [...element.querySelectorAll("img")].map(async (image) => {
      try {
        await image.decode();
      } catch {
        throw new Error(
          "A photo could not be loaded. Please try again once it is available.",
        );
      }
    }),
  );
}
export async function exportDiary(
  diary: HTMLElement,
  player: HTMLElement,
  progress: (message: string) => void,
  signal?: AbortSignal,
): Promise<ShareImage[]> {
  const results: ShareImage[] = [];
  try {
    // Paint highlights word by word: canvas renderers otherwise draw one large
    // rectangle over preceding text when an inline mark wraps onto another line.
    for (const mark of diary.querySelectorAll("mark")) {
      if (mark.dataset.exportReady) continue;
      const color = getComputedStyle(mark).backgroundColor;
      const style = getComputedStyle(mark.firstElementChild || mark);
      const weight = style.fontWeight,
        fontStyle = style.fontStyle;
      const tokens =
        (mark.textContent || "").match(
          /[\u3400-\u9fff]|[^\s\u3400-\u9fff]+|\s+/g,
        ) || [];
      const fragment = document.createDocumentFragment();
      tokens.forEach((token) => {
        const span = document.createElement("span");
        span.textContent = token;
        span.style.backgroundColor = color;
        span.style.fontWeight = weight;
        span.style.fontStyle = fontStyle;
        span.style.whiteSpace = "pre";
        span.style.display = "inline-block";
        fragment.append(span);
      });
      mark.replaceChildren(fragment);
      mark.style.background = "transparent";
      mark.style.padding = "0";
      mark.dataset.exportReady = "true";
    }
    signal?.throwIfAborted();
    await ready(diary);
    await ready(player);
    const base = diary.getBoundingClientRect();
    const avoid: AvoidBreak[] = [];
    const walker = document.createTreeWalker(diary, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      for (const r of range.getClientRects())
        avoid.push({
          top: r.top - base.top - 2,
          bottom: r.bottom - base.top + 2,
        });
    }
    for (const img of diary.querySelectorAll("img")) {
      const r = img.getBoundingClientRect();
      avoid.push({
        top: r.top - base.top - 8,
        bottom: r.bottom - base.top + 8,
      });
    }
    const slices = pageSlices(
      Math.ceil(base.height),
      height - inset * 2 - 28,
      avoid,
    );
    if (slices.length > 60)
      throw new Error(
        "This diary is too long to export on this device. Please split it into smaller moments.",
      );
    const total = slices.length + 1;
    for (let i = 0; i < total; i++) {
      signal?.throwIfAborted();
      progress(`Preparing image ${i + 1} of ${total}…`);
      const isPlayer = i === slices.length;
      const node = isPlayer ? player : diary;
      const slice = slices[i];
      const capture = await html2canvas(node, {
        scale,
        backgroundColor: "#fbfaf6",
        logging: false,
        useCORS: true,
        width,
        height: isPlayer ? height : slice.height,
        y: isPlayer ? 0 : slice.top,
        windowWidth: 390,
        scrollX: 0,
        scrollY: 0,
      });
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image export is unavailable in this browser.");
      ctx.fillStyle = "#fbfaf6";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (isPlayer) ctx.drawImage(capture, 0, 0);
      else ctx.drawImage(capture, 0, inset * scale);
      ctx.fillStyle = "#848077";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("RAMBLING", 48, canvas.height - 28);
      ctx.textAlign = "right";
      ctx.fillText(
        `${i + 1} / ${total}`,
        canvas.width - 48,
        canvas.height - 28,
      );
      signal?.throwIfAborted();
      const blob = await toBlob(canvas);
      const file = new File(
        [blob],
        `rambling-${String(i + 1).padStart(2, "0")}${isPlayer ? "-soundtrack" : "-diary"}.png`,
        { type: "image/png" },
      );
      results.push({ file, url: URL.createObjectURL(blob) });
      capture.width = 0;
      canvas.width = 0;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    return results;
  } catch (error) {
    results.forEach((image) => URL.revokeObjectURL(image.url));
    throw error;
  }
}
export async function downloadImages(images: ShareImage[]) {
  const entries: Record<string, Uint8Array> = {};
  for (const image of images)
    entries[image.file.name] = new Uint8Array(await image.file.arrayBuffer());
  const bytes = zipSync(entries, { level: 0 });
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], { type: "application/zip" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "rambling-moment.zip";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
