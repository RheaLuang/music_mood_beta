import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { diaryExtensions } from "../utils/editorExtensions";
import {
  richDocument,
  withDocument,
  highlightColors,
} from "../utils/richDocument";
import {
  ArrowLeft,
  LockKeyhole,
  ImagePlus,
  Bold,
  Undo2,
  Redo2,
  List,
  ListOrdered,
  Eraser,
  Check,
} from "lucide-react";
import type { Moment } from "../types";
import { moods } from "../data/demo";
import { DiaryHeader } from "../components/Diary";
import { Sleeve } from "../components/Vinyl";
import { localImage } from "../utils/images";

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
  const [busy, setBusy] = useState(false);
  const patch = (p: Partial<Moment>) => set((value) => ({ ...value, ...p }));
  const [, redraw] = useState(0);
  const editor = useEditor({
    extensions: diaryExtensions(),
    content: richDocument(initial),
    editorProps: {
      attributes: {
        class: "notes-document",
        role: "textbox",
        "aria-label": "Diary body",
        "aria-multiline": "true",
        spellcheck: "true",
      },
    },
    onUpdate: ({ editor }) =>
      set((value) => withDocument(value, editor.getJSON(), editor.getText())),
    onTransaction: () => redraw((value) => value + 1),
  });
  async function image(file: File | undefined, cover = false) {
    if (!file) return;
    setBusy(true);
    try {
      const src = await localImage(file);
      if (cover) patch({ sleeveImage: src });
      else
        editor
          ?.chain()
          .focus()
          .setImage({ src, alt: "A photograph from this moment" })
          .createParagraphNear()
          .run();
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function submit() {
    if (!save(editor ? withDocument(m, editor.getJSON(), editor.getText()) : m))
      setError(
        "Storage is full or unavailable. Your draft is still here; try removing a photo before saving.",
      );
  }
  return (
    <main className="editor">
      <header className="page-top">
        <button aria-label="Cancel editing" onClick={cancel}>
          <ArrowLeft />
        </button>
        <span>{initial.body ? "Edit moment" : "Create a moment"}</span>
        <button className="text-button" onClick={submit} disabled={busy}>
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
        <small>LOCKED · ON REPEAT</small>
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
      {
        <div hidden={panel !== "diary"}>
          <div
            className="editor-tools notes-toolbar"
            role="toolbar"
            aria-label="Text formatting"
          >
            <div className="format-actions">
              <button
                aria-label="Bold"
                title="Bold (Ctrl / ⌘ B)"
                aria-pressed={editor?.isActive("bold") || false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold size={18} />
              </button>
              <button
                aria-label="Bullet list"
                aria-pressed={editor?.isActive("bulletList") || false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
              >
                <List size={18} />
              </button>
              <button
                aria-label="Numbered list"
                aria-pressed={editor?.isActive("orderedList") || false}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor?.chain().focus().toggleOrderedList().run()
                }
              >
                <ListOrdered size={18} />
              </button>
              <button
                aria-label="Undo"
                disabled={!editor?.can().undo()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor?.chain().focus().undo().run()}
              >
                <Undo2 size={18} />
              </button>
              <button
                aria-label="Redo"
                disabled={!editor?.can().redo()}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor?.chain().focus().redo().run()}
              >
                <Redo2 size={18} />
              </button>
              <label className="icon-upload" title="Insert photo at cursor">
                <ImagePlus size={18} />
                <input
                  type="file"
                  accept="image/*"
                  aria-label="Insert diary photo"
                  disabled={busy}
                  onChange={(e) => {
                    void image(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <div
              className="marker-colors"
              role="group"
              aria-label="Highlighter colors"
            >
              <span>Highlight</span>
              {highlightColors.map(({ name, color }) => (
                <button
                  key={name}
                  aria-label={`${name} highlight`}
                  title={name}
                  aria-pressed={
                    editor?.isActive("highlight", { color }) || false
                  }
                  style={{ "--marker": color } as React.CSSProperties}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    editor?.chain().focus().setHighlight({ color }).run()
                  }
                />
              ))}
              <button
                className="clear-marker"
                aria-label="Remove highlight"
                title="Remove highlight"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => editor?.chain().focus().unsetHighlight().run()}
              >
                <Eraser size={16} />
              </button>
            </div>
          </div>
          <div className="diary-paper sans">
            <DiaryHeader date={m.createdAt} />
            <input
              className="title-input"
              aria-label="Diary title"
              placeholder="Give this chapter a name (optional)"
              value={m.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <EditorContent editor={editor} />
          </div>
          <div className="decoration-tools">
            <span className="small">A little finishing touch</span>
            <div>
              {["✺", "♡", "✿", "☾", "〰"].map((s) => (
                <button
                  key={s}
                  aria-label={"Insert " + s + " decoration"}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().insertContent(s).run()}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      {
        <div className="sleeve-editor" hidden={panel !== "sleeve"}>
          <Sleeve moment={m} />
          <h2>Even a feeling needs a cover.</h2>
          <p>Pick the jacket that feels like today.</p>
          <div className="tabs">
            {(["original", "paper", "ink"] as const).map((s) => (
              <button
                key={s}
                className={m.sleeve === s && !m.sleeveImage ? "selected" : ""}
                onClick={() => patch({ sleeve: s, sleeveImage: undefined })}
              >
                {s === "original" ? "Album" : s === "paper" ? "Paper" : "Ink"}
              </button>
            ))}
          </div>
          <label className="cover-upload">
            <ImagePlus size={18} />
            {m.sleeveImage ? "Change cover photo" : "Choose a photo"}
            <input
              type="file"
              accept="image/*"
              aria-label="Choose sleeve photo"
              disabled={busy}
              onChange={(e) => {
                void image(e.target.files?.[0], true);
                e.target.value = "";
              }}
            />
          </label>
          {m.sleeveImage && (
            <p>
              Cropped to a square · Choose a style above to restore the original
            </p>
          )}
        </div>
      }
      <section className="mood-picker face-picker">
        <h3>
          Mood <span>Your inner weather report</span>
        </h3>
        <div className="mood-faces">
          {moods.map((mood) => (
            <button
              key={mood.level}
              aria-label={mood.label}
              aria-pressed={m.mood?.level === mood.level}
              className={m.mood?.level === mood.level ? "chosen" : ""}
              style={{ "--mood-color": mood.color } as React.CSSProperties}
              onClick={() =>
                patch({ mood: { ...mood, label: m.mood?.label || "" } })
              }
            >
              <span>{mood.emoji}</span>
              <small>{mood.label}</small>
            </button>
          ))}
        </div>
        {m.mood && (
          <label className="mood-label">
            Put it in your own words
            <input
              aria-label="Mood label"
              maxLength={40}
              placeholder="A good kind of tired. A little homesick…"
              value={m.mood.label}
              onChange={(e) =>
                patch({ mood: { ...m.mood!, label: e.target.value } })
              }
            />
          </label>
        )}
        <button
          className="no-mood"
          aria-pressed={!m.mood}
          onClick={() => patch({ mood: undefined })}
        >
          No label today
        </button>
      </section>
      {busy && (
        <p className="footnote" role="status">
          Getting your photo ready…
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary save-bottom" disabled={busy} onClick={submit}>
        Press this moment into vinyl <span>↗</span>
      </button>
      <p className="footnote">Only on this device. No audience. Just you.</p>
    </main>
  );
}
