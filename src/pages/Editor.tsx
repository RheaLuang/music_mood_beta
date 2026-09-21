import { useRef, useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  ImagePlus,
  Highlighter,
  X,
  Check,
} from "lucide-react";
import type { Moment } from "../types";
import { moods } from "../data/demo";
import { DiaryHeader } from "../components/Diary";
import { Sleeve } from "../components/Vinyl";
export function Editor({
  initial,
  save,
  cancel,
}: {
  initial: Moment;
  save: (m: Moment) => boolean;
  cancel: () => void;
}) {
  const [m, set] = useState(initial);
  const [panel, setPanel] = useState<"diary" | "sleeve">("diary");
  const [error, setError] = useState("");
  const body = useRef<HTMLTextAreaElement>(null);
  const patch = (v: Partial<Moment>) => set((x) => ({ ...x, ...v }));
  async function photo(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Choose a photo smaller than 2 MB for this demo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch({ photos: [...m.photos, String(reader.result)] });
      setError("");
    };
    reader.readAsDataURL(file);
  }
  return (
    <main className="editor">
      <header className="page-top">
        <button aria-label="Cancel editing" onClick={cancel}>
          <ArrowLeft />
        </button>
        <span>{initial.body ? "EDIT MOMENT" : "A NEW MOMENT"}</span>
        <button
          className="text-button"
          onClick={() => {
            if (!save(m))
              setError(
                "Your browser storage is full or unavailable. Remove a photo and try again. Your draft is still here.",
              );
          }}
        >
          Save <Check size={16} />
        </button>
      </header>
      <div className="locked-song">
        <img src={m.song.artwork} alt="" />
        <div>
          <strong>{m.song.title}</strong>
          <span>{m.song.artist}</span>
        </div>
        <LockKeyhole size={14} />
        <small>LOCKED · LOOP</small>
      </div>
      <div className="tabs">
        <button
          className={panel === "diary" ? "selected" : ""}
          onClick={() => setPanel("diary")}
        >
          The diary
        </button>
        <button
          className={panel === "sleeve" ? "selected" : ""}
          onClick={() => setPanel("sleeve")}
        >
          The sleeve
        </button>
      </div>
      {panel === "diary" ? (
        <>
          <div className="editor-tools">
            <select
              aria-label="Diary font"
              value={m.font}
              onChange={(e) =>
                patch({ font: e.target.value as Moment["font"] })
              }
            >
              <option value="serif">Editorial serif</option>
              <option value="sans">Simple sans</option>
              <option value="hand">Personal script</option>
            </select>
            <button
              aria-label="Highlight selected diary text"
              onClick={() => {
                const el = body.current;
                if (el && el.selectionEnd > el.selectionStart) {
                  patch({
                    highlight: m.body.slice(el.selectionStart, el.selectionEnd),
                  });
                  setError("");
                } else
                  setError(
                    "Select a passage in your diary, then tap highlight.",
                  );
              }}
            >
              <Highlighter size={18} />
            </button>
            <label className="icon-upload" aria-label="Add a photo">
              <ImagePlus size={18} />
              <input
                aria-label="Add a photo"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  void photo(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className={`diary-paper ${m.font}`}>
            <DiaryHeader date={m.createdAt} />
            <input
              className="title-input"
              aria-label="Diary title"
              placeholder="A title, if you like…"
              value={m.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <textarea
              ref={body}
              className="body-input"
              aria-label="Diary content"
              placeholder="What does this song feel like today?"
              value={m.body}
              onChange={(e) => patch({ body: e.target.value })}
            />
            {m.highlight && (
              <div className="highlight-preview">
                <mark>{m.highlight}</mark>
                <button
                  aria-label="Remove highlight"
                  onClick={() => patch({ highlight: "" })}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {m.photos.map((p, i) => (
              <div className="photo-edit" key={i}>
                <img src={p} alt="Diary photograph" />
                <button
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() =>
                    patch({ photos: m.photos.filter((_, n) => n !== i) })
                  }
                >
                  <X />
                </button>
              </div>
            ))}
            <div className="sticker-zone">
              {m.stickers.map((s, i) => (
                <button
                  key={i}
                  title="Remove sticker"
                  aria-label={`Remove sticker ${i + 1}`}
                  onClick={() =>
                    patch({ stickers: m.stickers.filter((_, n) => n !== i) })
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="decoration-tools">
            <span className="small">A SMALL FINISHING TOUCH</span>
            <div>
              {["✺", "♡", "✿", "☾", "〰"].map((s) => (
                <button
                  key={s}
                  aria-label={`Add ${s} sticker`}
                  onClick={() => patch({ stickers: [...m.stickers, s] })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="sleeve-editor">
          <Sleeve moment={m} />
          <h2>Make it feel like you.</h2>
          <p>The sleeve is yours. The record keeps the song.</p>
          <div className="tabs">
            {(["original", "paper", "ink"] as const).map((s) => (
              <button
                key={s}
                className={m.sleeve === s ? "selected" : ""}
                onClick={() => patch({ sleeve: s })}
              >
                {s === "original" ? "Album" : s === "paper" ? "Paper" : "Ink"}
              </button>
            ))}
          </div>
        </div>
      )}
      <section className="mood-picker">
        <h3>
          A little bookmark for the feeling <span>optional</span>
        </h3>
        <div>
          {moods.map((mood) => (
            <button
              key={mood.label}
              aria-pressed={m.mood?.label === mood.label}
              className={m.mood?.label === mood.label ? "chosen" : ""}
              onClick={() =>
                patch({ mood: m.mood?.label === mood.label ? undefined : mood })
              }
            >
              {mood.emoji} {mood.label}
            </button>
          ))}
          <button
            onClick={() => patch({ mood: undefined })}
            aria-pressed={!m.mood}
          >
            No mood
          </button>
        </div>
      </section>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button
        className="primary save-bottom"
        onClick={() => {
          if (!save(m))
            setError(
              "Could not save to browser storage. Your draft is still here. Try removing a photo.",
            );
        }}
      >
        Press this moment into vinyl <span>↗</span>
      </button>
      <p className="footnote">Only here, on this device. Just for you.</p>
    </main>
  );
}
