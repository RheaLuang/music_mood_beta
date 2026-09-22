import { ArrowLeft, Heart, Pause, Play, Pencil } from "lucide-react";
import type { Moment } from "../types";
import { Record } from "../components/Vinyl";
import { DiaryHeader, DiaryContent } from "../components/Diary";
export function Reading({
  moment: m,
  playing,
  toggle,
  back,
  edit,
  like,
}: {
  moment: Moment;
  playing: boolean;
  toggle: () => void;
  back: () => void;
  edit: () => void;
  like: () => void;
}) {
  return (
    <main className="reading">
      <header className="page-top">
        <button aria-label="返回我的黑胶" onClick={back}>
          <ArrowLeft />
        </button>
        <span>那天的你，正在返场</span>
        <button aria-label="编辑日记" onClick={edit}>
          <Pencil size={18} />
        </button>
      </header>
      <div className="reading-vinyl">
        <Record song={m.song} playing={playing} />
        <div className="reading-controls">
          <button
            aria-label={m.liked ? "取消收藏" : "收藏此刻"}
            aria-pressed={m.liked}
            onClick={like}
          >
            <Heart size={20} fill={m.liked ? "currentColor" : "none"} />
          </button>
          <button
            aria-label={playing ? "暂停唱片" : "播放唱片"}
            onClick={toggle}
          >
            {playing ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
      <div className="reading-song">
        <span>{m.song.title}</span>
        <small>{m.song.artist}</small>
      </div>
      <article className="diary-paper">
        <DiaryHeader date={m.createdAt} />
        {m.mood && (
          <p className="reading-mood">
            {m.mood.emoji} {m.mood.label}
          </p>
        )}
        <DiaryContent moment={m} />
        <footer className="diary-end">
          <span>✳</span>
          <p>听完了。那天的你，还好好地待在这里。</p>
          <small>RAMBLING · 私人珍藏</small>
        </footer>
      </article>
    </main>
  );
}
