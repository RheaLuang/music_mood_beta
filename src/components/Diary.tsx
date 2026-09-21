import type { Moment } from "../types";
export function DiaryHeader({ date }: { date: string }) {
  const d = new Date(date);
  return (
    <header className="diary-header">
      <div className="date-main">
        <span className="day">{d.getDate().toString().padStart(2, "0")}</span>
        <div className="month">
          {d.toLocaleDateString("en", { month: "long" })}
        </div>
        <div className="year">{d.getFullYear()}</div>
      </div>
      <div className="time-box">
        <span>
          {d.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <hr />
        <span>{d.toLocaleDateString("en", { weekday: "short" })}</span>
      </div>
    </header>
  );
}
export function DiaryContent({ moment: m }: { moment: Moment }) {
  const ix = m.highlight ? m.body.indexOf(m.highlight) : -1;
  return (
    <div className={`diary-content ${m.font}`}>
      {m.title && <h2>{m.title}</h2>}
      <p>
        {ix >= 0 ? (
          <>
            {m.body.slice(0, ix)}
            <mark>{m.highlight}</mark>
            {m.body.slice(ix + m.highlight.length)}
          </>
        ) : (
          m.body
        )}
      </p>
      {m.photos.map((photo, i) => (
        <figure key={i}>
          <img src={photo} alt={`Photo from this moment ${i + 1}`} />
          <figcaption>A little piece of that day.</figcaption>
        </figure>
      ))}
      <div className="sticker-zone" aria-label="Diary decorations">
        {m.stickers.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  );
}
