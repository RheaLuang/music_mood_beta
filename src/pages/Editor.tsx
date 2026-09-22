import { useRef, useState } from "react";
import {
  ArrowLeft,
  LockKeyhole,
  ImagePlus,
  Highlighter,
  X,
  Check,
} from "lucide-react";
import type { DiaryBlock, Moment, TextBlock } from "../types";
import { moods } from "../data/demo";
import { DiaryHeader } from "../components/Diary";
import { Sleeve } from "../components/Vinyl";
import {
  documentBlocks,
  insertBlock,
  splitTextBlock,
  withBlocks,
} from "../utils/document";
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
  const [m, set] = useState(() => withBlocks(initial, documentBlocks(initial)));
  const [panel, setPanel] = useState<"diary" | "sleeve">("diary");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState("");
  const cursor = useRef({ id: "", start: 0, end: 0 });
  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const blocks = m.blocks!;
  const current = blocks.find((b) => b.id === active && b.type === "text") as
    | TextBlock
    | undefined;
  const patch = (p: Partial<Moment>) => set((value) => ({ ...value, ...p }));
  function changeBlock(id: string, update: Partial<TextBlock>) {
    set((value) =>
      withBlocks(
        value,
        value.blocks!.map((b) =>
          b.id === id ? ({ ...b, ...update } as DiaryBlock) : b,
        ),
      ),
    );
  }
  function insert(media: DiaryBlock) {
    set((value) => {
      const next = insertBlock(
        value.blocks!,
        cursor.current.id,
        cursor.current.start,
        media,
      );
      const following = next[next.findIndex((b) => b.id === media.id) + 1];
      requestAnimationFrame(() => fields.current.get(following.id)?.focus());
      return withBlocks(value, next);
    });
  }
  async function image(file: File | undefined, cover = false) {
    if (!file) return;
    setBusy(true);
    try {
      const src = await localImage(file);
      if (cover) patch({ sleeveImage: src });
      else insert({ id: crypto.randomUUID(), type: "image", src });
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function remember(el: HTMLTextAreaElement, id: string) {
    setActive(id);
    cursor.current = { id, start: el.selectionStart, end: el.selectionEnd };
  }
  function submit() {
    if (!save(m))
      setError("本地空间不足或暂时不可用。草稿还在，请移除部分图片后再保存。");
  }
  return (
    <main className="editor">
      <header className="page-top">
        <button aria-label="取消编辑" onClick={cancel}>
          <ArrowLeft />
        </button>
        <span>{initial.body ? "编辑此刻" : "记录此刻"}</span>
        <button className="text-button" onClick={submit} disabled={busy}>
          保存 <Check size={16} />
        </button>
      </header>
      <div className="locked-song">
        <img src={m.song.artwork} alt="" />
        <div>
          <strong>{m.song.title}</strong>
          <span>{m.song.artist}</span>
        </div>
        <LockKeyhole size={14} />
        <small>已锁定 · 循环</small>
      </div>
      <div className="tabs">
        <button
          className={panel === "diary" ? "selected" : ""}
          onClick={() => setPanel("diary")}
        >
          写日记
        </button>
        <button
          className={panel === "sleeve" ? "selected" : ""}
          onClick={() => setPanel("sleeve")}
        >
          设计封套
        </button>
      </div>
      {panel === "diary" ? (
        <>
          <div className="editor-tools flow-toolbar">
            <select
              aria-label="文字层级"
              value={current?.style || "body"}
              onChange={(e) => {
                const id =
                  current?.id || blocks.find((b) => b.type === "text")!.id;
                changeBlock(id, {
                  style: e.target.value as TextBlock["style"],
                });
                fields.current.get(id)?.focus();
              }}
            >
              <option value="heading">标题</option>
              <option value="subheading">副标题</option>
              <option value="body">正文</option>
            </select>
            <select
              aria-label="日记字体"
              value={m.font}
              onChange={(e) =>
                patch({ font: e.target.value as Moment["font"] })
              }
            >
              <option value="serif">宋体</option>
              <option value="sans">黑体</option>
              <option value="hand">手写</option>
            </select>
            <button
              aria-label="高亮选中文字"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const { id, start, end } = cursor.current;
                const block = blocks.find((b) => b.id === id) as
                  | TextBlock
                  | undefined;
                if (block && end > start) {
                  changeBlock(id, { highlight: block.text.slice(start, end) });
                  setError("");
                } else setError("先选中一段文字，再轻点高亮。");
              }}
            >
              <Highlighter size={18} />
            </button>
            <label className="icon-upload">
              <ImagePlus size={18} />
              <input
                type="file"
                accept="image/*"
                aria-label="插入日记图片"
                disabled={busy}
                onChange={(e) => {
                  void image(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <div className={"diary-paper " + m.font}>
            <DiaryHeader date={m.createdAt} />
            <input
              className="title-input"
              aria-label="日记标题"
              placeholder="这一集叫什么？（选填）"
              value={m.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <div className="document-editor">
              {blocks.map((b, i) =>
                b.type === "text" ? (
                  <div key={b.id} className={"text-block block-" + b.style}>
                    <textarea
                      rows={1}
                      ref={(el) => {
                        if (el) {
                          fields.current.set(b.id, el);
                          el.style.height = "auto";
                          el.style.height =
                            Math.max(56, el.scrollHeight) + "px";
                        } else fields.current.delete(b.id);
                      }}
                      aria-label={"第" + (i + 1) + "段文字"}
                      placeholder={
                        i === 0
                          ? "不必从头讲。就从脑海里冒出的那一句开始。"
                          : "后来呢？"
                      }
                      value={b.text}
                      onFocus={(e) => remember(e.currentTarget, b.id)}
                      onSelect={(e) => remember(e.currentTarget, b.id)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          !e.nativeEvent.isComposing
                        ) {
                          e.preventDefault();
                          const next = splitTextBlock(
                            blocks,
                            b.id,
                            e.currentTarget.selectionStart,
                            e.currentTarget.selectionEnd,
                          );
                          const following =
                            next[next.findIndex((x) => x.id === b.id) + 1];
                          set((value) => withBlocks(value, next));
                          requestAnimationFrame(() =>
                            fields.current.get(following.id)?.focus(),
                          );
                        } else if (
                          e.key === "Backspace" &&
                          !b.text &&
                          i > 0 &&
                          blocks[i - 1].type === "text"
                        ) {
                          e.preventDefault();
                          const previous = blocks[i - 1];
                          set((value) =>
                            withBlocks(
                              value,
                              value.blocks!.filter((x) => x.id !== b.id),
                            ),
                          );
                          requestAnimationFrame(() =>
                            fields.current.get(previous.id)?.focus(),
                          );
                        }
                      }}
                      onChange={(e) => {
                        changeBlock(b.id, { text: e.target.value });
                        remember(e.currentTarget, b.id);
                      }}
                    />
                    {b.highlight && b.text.includes(b.highlight) && (
                      <div className="highlight-preview">
                        <mark>{b.highlight}</mark>
                        <button
                          aria-label="移除高亮"
                          onClick={() => changeBlock(b.id, { highlight: "" })}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={b.id}
                    className={
                      b.type === "image" ? "photo-edit" : "flow-sticker"
                    }
                  >
                    {b.type === "image" ? (
                      <img src={b.src} alt="日记图片" />
                    ) : (
                      <span>{b.text}</span>
                    )}
                    <button
                      aria-label={b.type === "image" ? "移除图片" : "移除装饰"}
                      onClick={() =>
                        set((value) =>
                          withBlocks(
                            value,
                            value.blocks!.filter((x) => x.id !== b.id),
                          ),
                        )
                      }
                    >
                      <X size={16} />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="decoration-tools">
            <span className="small">给心事盖个小印章</span>
            <div>
              {["✺", "♡", "✿", "☾", "〰"].map((s) => (
                <button
                  key={s}
                  aria-label={"插入" + s + "装饰"}
                  onClick={() =>
                    insert({
                      id: crypto.randomUUID(),
                      type: "sticker",
                      text: s,
                    })
                  }
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
          <h2>心事，也要有封面。</h2>
          <p>穿哪件外套，由这一刻的你决定。</p>
          <div className="tabs">
            {(["original", "paper", "ink"] as const).map((s) => (
              <button
                key={s}
                className={m.sleeve === s && !m.sleeveImage ? "selected" : ""}
                onClick={() => patch({ sleeve: s, sleeveImage: undefined })}
              >
                {s === "original" ? "专辑" : s === "paper" ? "纸感" : "墨色"}
              </button>
            ))}
          </div>
          <label className="cover-upload">
            <ImagePlus size={18} />
            {m.sleeveImage ? "更换封面图片" : "从相册选择"}
            <input
              type="file"
              accept="image/*"
              aria-label="选择封套图片"
              disabled={busy}
              onChange={(e) => {
                void image(e.target.files?.[0], true);
                e.target.value = "";
              }}
            />
          </label>
          {m.sleeveImage && <p>已居中裁切为方形 · 点选上方样式可恢复</p>}
        </div>
      )}
      <section className="mood-picker face-picker">
        <h3>
          记录心情 <span>今天的内心天气</span>
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
            再加一句自己的旁白
            <input
              aria-label="心情文字"
              maxLength={40}
              placeholder="比如：累但开心，有点想家……"
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
          今天就不贴标签了
        </button>
      </section>
      {busy && (
        <p className="footnote" role="status">
          正在整理图片……
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button className="primary save-bottom" disabled={busy} onClick={submit}>
        把此刻，刻进黑胶 <span>↗</span>
      </button>
      <p className="footnote">存在这台设备里。没有观众，只有你。</p>
    </main>
  );
}
