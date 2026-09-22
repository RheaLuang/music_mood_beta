import { describe, expect, it } from "vitest";
import { chineseMonth, chineseYear } from "./date";
import { pageSlices } from "./pagination";
describe("Diary export pagination", () => {
  it("covers long diaries without gaps or overlap and keeps ordinary photos together", () => {
    const pages = pageSlices(2400, 768, [
      { top: 710, bottom: 730 },
      { top: 740, bottom: 1200 },
    ]);
    expect(pages[0]).toEqual({ top: 0, height: 740 });
    expect(pages.reduce((n, p) => n + p.height, 0)).toBe(2400);
    pages.forEach((page, i) => {
      expect(page.height).toBeLessThanOrEqual(768);
      if (i) expect(page.top).toBe(pages[i - 1].top + pages[i - 1].height);
    });
  });
  it("moves a cut above a text line, handles oversized elements and short diaries", () => {
    expect(pageSlices(900, 768, [{ top: 758, bottom: 780 }])[0].height).toBe(
      758,
    );
    expect(pageSlices(1600, 768, [{ top: 0, bottom: 1550 }])).toHaveLength(3);
    expect(pageSlices(200, 768, [])).toEqual([{ top: 0, height: 200 }]);
  });
  it("spells diary years and all twelve months in Chinese", () => {
    expect(chineseYear(2026)).toBe("二零二六年");
    expect(chineseMonth(0)).toBe("一月");
    expect(chineseMonth(8)).toBe("九月");
    expect(chineseMonth(9)).toBe("十月");
    expect(chineseMonth(10)).toBe("十一月");
    expect(chineseMonth(11)).toBe("十二月");
  });
});
