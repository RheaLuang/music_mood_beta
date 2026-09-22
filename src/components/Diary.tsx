import type { Moment } from "../types";
import { documentBlocks } from "../utils/document";
export function DiaryHeader({ date }: { date: string }) {
  const d = new Date(date);
  return (
    <header className="diary-header">
      <div className="date-main">
        <span className="day">{d.getDate().toString().padStart(2, "0")}</span>
        <div className="month">{d.getMonth() + 1}月</div>
        <div className="year">{d.getFullYear()}年</div>
      </div>
      <div className="time-box">
        <span>
          {d.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <hr />
        <span>{d.toLocaleDateString("zh-CN", { weekday: "long" })}</span>
      </div>
    </header>
  );
}
function Highlight({ text, highlight }: { text: string; highlight?: string }) {
  const ix = highlight ? text.indexOf(highlight) : -1;
  return ix < 0 ? (
    <>{text}</>
  ) : (
    <>
      {text.slice(0, ix)}
      <mark>{highlight}</mark>
      {text.slice(ix + highlight!.length)}
    </>
  );
}
export function DiaryContent({ moment: m }: { moment: Moment }) {
  return (
    <div className={"diary-content " + m.font}>
      {m.title && <h2>{m.title}</h2>}
      {documentBlocks(m).map((b) => {
        if (b.type === "image")
          return (
            <figure key={b.id}>
              <img src={b.src} alt="此刻的照片" />
            </figure>
          );
        if (b.type === "sticker")
          return (
            <div className="flow-sticker" key={b.id} aria-label="日记装饰">
              {b.text}
            </div>
          );
        const Tag =
          b.style === "heading" ? "h2" : b.style === "subheading" ? "h3" : "p";
        return (
          <Tag key={b.id} className={"block-" + b.style}>
            <Highlight text={b.text} highlight={b.highlight} />
          </Tag>
        );
      })}
    </div>
  );
}
