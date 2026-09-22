import { useState, useRef, useEffect } from "react";
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
  const source = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<number>();
  const [origin, setOrigin] = useState({ x: 0, y: 100 });
  useEffect(() => () => window.clearTimeout(timer.current), []);
  function pull(m: Moment, element: HTMLButtonElement) {
    source.current = element;
    const rect = element.getBoundingClientRect();
    setOrigin({
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
    });
    select(m);
    setReveal(false);
  }
  function putBack() {
    window.clearTimeout(timer.current);
    select(null);
    source.current?.focus({ preventScroll: true });
  }
  const periodNames = { Week: "Week", Month: "Month", Year: "Year" };
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
        ? date.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
        : `${new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  return (
    <section className="collection">
      <div className="collection-intro">
        <span className="eyebrow">THE LOST-AND-FOUND OF FEELINGS</span>
        <h1>Old feelings. Good company.</h1>
        <p>
          {moments.length} records. Some days come back with the first note.
        </p>
      </div>
      <div className="period-tabs" role="group" aria-label="Browse by period">
        {(["Week", "Month", "Year"] as const).map((x) => (
          <button
            key={periodNames[x]}
            className={mode === x ? "selected" : ""}
            aria-pressed={mode === x}
            onClick={() => setMode(x)}
          >
            {periodNames[x]}
          </button>
        ))}
      </div>
      <div className="period-heading">
        <button
          aria-label={`Previous ${periodNames[mode]}`}
          onClick={() => shift(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <h2>{heading}</h2>
        <button
          aria-label={`Next ${periodNames[mode]}`}
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
                          style={{
                            backgroundImage: `url(${m.sleeveImage || m.song.artwork})`,
                          }}
                        />
                      ))}
                      {!entries.length && <span>Room for a new memory</span>}
                    </div>
                    <div>
                      <strong>
                        {new Date(2000, month).toLocaleDateString("en-GB", {
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
              <h2>Nothing on this shelf. Yet.</h2>
              <p>Perhaps you were too busy living to leave a note.</p>
              <button onClick={() => setDate(new Date())}>Back to today</button>
            </div>
          ) : mode === "Month" && !grid ? (
            <>
              <p className="shelf-hint">
                Which version of you shall we meet today?
                <br />
                Pull out a record. There is a story on the other side.
              </p>
              <div className="shelf-scroll">
                <div className="vinyl-shelf">
                  {filtered.map((m, i) => (
                    <button
                      className="spine"
                      key={m.id}
                      aria-label={`Pull out ${m.title || m.song.title}`}
                      onClick={(e) => pull(m, e.currentTarget)}
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
                {filtered.length} private records ·{" "}
                {date.toLocaleDateString("en-GB", { month: "long" })}
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
                  onClick={(e) => pull(m, e.currentTarget)}
                >
                  <Sleeve moment={m} />
                  <div className="item-caption">
                    <span>
                      {new Date(m.createdAt).toLocaleDateString("en-GB", {
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
              aria-label="Selected vinyl"
              initial={{ ...origin, rotate: -5, scale: 0.15 }}
              animate={{ x: 0, y: 0, rotate: 0, scale: 1 }}
              exit={{ ...origin, rotate: 0, scale: 0.12, opacity: 0 }}
              transition={{ duration: 0.45 }}
              onKeyDown={(e) => {
                if (e.key === "Escape") putBack();
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
              <div className={`extracted ${reveal ? "reveal" : ""}`}>
                <Record song={selected.song} />
                <Sleeve moment={selected} />
              </div>
              <div className="inspection-actions">
                <button
                  autoFocus
                  className="primary"
                  onClick={() => {
                    if (reveal) return;
                    setReveal(true);
                    timer.current = window.setTimeout(() => {
                      open(selected);
                      select(null);
                    }, 550);
                  }}
                >
                  Open <span>↗</span>
                </button>
                <button className="put-back" onClick={putBack}>
                  Put it back
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
