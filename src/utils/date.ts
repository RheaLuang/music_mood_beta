export const chineseYear = (year: number) =>
  String(year)
    .split("")
    .map((n) => "零一二三四五六七八九"[Number(n)])
    .join("") + "年";
export const chineseMonth = (month: number) =>
  ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"][
    month
  ] + "月";
