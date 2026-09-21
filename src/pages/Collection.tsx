import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grid2X2, Library } from "lucide-react";
import type { Moment } from "../types";
import { Sleeve, Record } from "../components/Vinyl";
export function Collection({
  moments,
  open,
}: {
  moments: Moment[];
  open: (m: Moment) => void;
}) {
  const [mode, setMode] = useState<"Week" | "Month" | "Year">("Week");
  const [date, setDate] = useState(new Date());
  const [grid, setGrid] = useState(false);
  const [selected, select] = useState<Moment | null>(null);
  const [reveal, setReveal] = useState(false);
  const filtered = moments.filter((m) => {
    const d = new Date(m.createdAt);
    if (mode === "Year") return d.getFullYear() === date.getFullYear();
    if (mode === "Month")
      return (
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth()
      );
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  });
  function shift(n: number) {
    const d = new Date(date);
    if (mode === "Year") d.setFullYear(d.getFullYear() + n);
    else if (mode === "Month") {
      d.setDate(1);
      d.setMonth(d.getMonth() + n);
    } else d.setDate(d.getDate() + 7 * n);
    setDate(d);
  }
  const heading =
    mode === "Year"
      ? String(date.getFullYear())
      : mode === "Month"
        ? date.toLocaleDateString("en", { month: "long", year: "numeric" })
        : `${new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6).toLocaleDateString("en", { day: "numeric", month: "short" })} — ${date.toLocaleDateString("en", { day: "numeric", month: "short" })}`;
  return (
    <section className="collection">
      <div className="collection-intro">
        <span className="eyebrow">THE PERSONAL PRESSING</span>
        <h1>A record of feeling.</h1>
        <p>{moments.length} moments, each with a song to return to.</p>
      </div>
      <div className="period-tabs" role="group" aria-label="Collection period">
        {(["Week", "Month", "Year"] as const).map((x) => (
          <button
            key={x}
            className={mode === x ? "selected" : ""}
            aria-pressed={mode === x}
            onClick={() => setMode(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="period-heading">
        <button
          aria-label={`Previous ${mode.toLowerCase()}`}
          onClick={() => shift(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <h2>{heading}</h2>
        <button
          aria-label={`Next ${mode.toLowerCase()}`}
          onClick={() => shift(1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      {mode === "Month" && (
        <div className="layout-switch">
          <button aria-pressed={!grid} onClick={() => setGrid(false)}>
            <Library size={14} /> Shelf
          </button>
          <button aria-pressed={grid} onClick={() => setGrid(true)}>
            <Grid2X2 size={14} /> Grid
          </button>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={mode + date.toDateString() + grid}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.18 }}
        >
          {mode === "Year" ? (
            <div className="year-archive">
              {Array.from({ length: 12 }, (_, month) => {
                const entries = filtered.filter(
                  (m) => new Date(m.createdAt).getMonth() === month,
                );
                return (
                  <button
                    className="archive-month"
                    key={month}
                    onClick={() => {
                      setDate(new Date(date.getFullYear(), month, 1));
                      setMode("Month");
                      setGrid(false);
                    }}
                  >
                    <div className="mini-shelf">
                      {entries.slice(0, 12).map((m) => (
                        <i
                          key={m.id}
                          style={{ backgroundImage: `url(${m.song.artwork})` }}
                        />
                      ))}
                      {!entries.length && <span>Still unwritten</span>}
                    </div>
                    <div>
                      <strong>
                        {new Date(2000, month).toLocaleDateString("en", {
                          month: "long",
                        })}
                      </strong>
                      <small>{entries.length} records</small>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : !filtered.length ? (
            <div className="empty">
              <span>○</span>
              <h2>A little room for life.</h2>
              <p>No moments in this {mode.toLowerCase()} yet.</p>
              <button onClick={() => setDate(new Date())}>
                Return to today
              </button>
            </div>
          ) : mode === "Month" && !grid ? (
            <>
              <p className="shelf-hint">
                Run your fingers along the spines.
                <br />
                Choose a moment to pull it closer.
              </p>
              <div className="shelf-scroll">
                <div className="vinyl-shelf">
                  {filtered.map((m, i) => (
                    <button
                      className="spine"
                      key={m.id}
                      aria-label={`Pull out ${m.title || m.song.title}`}
                      onClick={() => {
                        select(m);
                        setReveal(false);
                      }}
                      style={{
                        backgroundColor: [
                          "#b7b7a1",
                          "#d8c6a4",
                          "#95a2a2",
                          "#baa392",
                        ][i % 4],
                      }}
                    >
                      {m.mood && (
                        <span
                          className="spine-mood"
                          style={{ background: m.mood.color }}
                        >
                          {m.mood.emoji}
                        </span>
                      )}
                      <span className="spine-title">{m.song.title}</span>
                      <small>
                        {new Date(m.createdAt)
                          .getDate()
                          .toString()
                          .padStart(2, "0")}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
              <p className="footnote">
                {filtered.length} individual pressings ·{" "}
                {date.toLocaleDateString("en", { month: "long" })}
              </p>
            </>
          ) : (
            <div
              className={`sleeve-grid ${mode === "Week" ? "scattered" : ""}`}
            >
              {filtered.map((m, i) => (
                <button
                  className="collection-item"
                  key={m.id}
                  style={
                    {
                      "--tilt": `${[-4, 3, 2, -2][i % 4]}deg`,
                    } as React.CSSProperties
                  }
                  onClick={() => {
                    select(m);
                    setReveal(false);
                  }}
                >
                  <Sleeve moment={m} />
                  <div className="item-caption">
                    <span>
                      {new Date(m.createdAt).toLocaleDateString("en", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                    <span>{m.title || m.song.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <AnimatePresence>
        {selected && (
          <motion.div
            className="inspection-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="inspection"
              role="dialog"
              aria-modal="true"
              aria-label="Inspect vinyl"
              initial={{ y: 100, rotate: -5, scale: 0.9 }}
              animate={{ y: 0, rotate: 0, scale: 1 }}
              exit={{ y: 160, rotate: 4, scale: 0.65 }}
              transition={{ duration: 0.45 }}
              onKeyDown={(e) => {
                if (e.key === "Escape") select(null);
                if (e.key === "Tab") {
                  const buttons = e.currentTarget.querySelectorAll("button");
                  if (e.shiftKey && document.activeElement === buttons[0]) {
                    e.preventDefault();
                    buttons[buttons.length - 1]?.focus();
                  } else if (
                    !e.shiftKey &&
                    document.activeElement === buttons[buttons.length - 1]
                  ) {
                    e.preventDefault();
                    buttons[0]?.focus();
                  }
                }
              }}
            >
              <span className="eyebrow">ONE MOMENT. ONE RECORD.</span>
              <div className={`extracted ${reveal ? "reveal" : ""}`}>
                <Record song={selected.song} />
                <Sleeve moment={selected} />
              </div>
              <h2>{selected.title || selected.song.title}</h2>
              <p>
                {selected.song.title} · {selected.song.artist}
              </p>
              <button
                autoFocus
                className="primary"
                onClick={() => {
                  if (reveal) return;
                  setReveal(true);
                  window.setTimeout(() => {
                    open(selected);
                    select(null);
                  }, 550);
                }}
              >
                Open vinyl <span>↗</span>
              </button>
              <button className="put-back" onClick={() => select(null)}>
                Put it back
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
