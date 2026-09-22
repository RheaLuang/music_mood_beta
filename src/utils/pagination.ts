export type PageSlice = { top: number; height: number };
export type AvoidBreak = { top: number; bottom: number };
// Keep each text line and ordinary photo together; oversized blocks may span pages.
export function pageSlices(
  height: number,
  pageHeight: number,
  avoid: AvoidBreak[],
): PageSlice[] {
  const pages: PageSlice[] = [];
  let top = 0;
  while (top < height) {
    let bottom = Math.min(top + pageHeight, height);
    for (let pass = 0; pass < avoid.length; pass++) {
      const crossing = avoid.find(
        (r) =>
          r.top < bottom &&
          r.bottom > bottom &&
          r.top > top + 40 &&
          r.bottom - r.top <= pageHeight,
      );
      if (!crossing) break;
      bottom = Math.floor(crossing.top);
    }
    pages.push({ top, height: bottom - top });
    top = bottom;
  }
  return pages;
}
