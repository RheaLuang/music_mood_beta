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
        <button aria-label="Back to my vinyls" onClick={back}>
          <ArrowLeft />
        </button>
        <span>A little encore from your past self</span>
        <button aria-label="Edit diary" onClick={edit}>
          <Pencil size={18} />
        </button>
      </header>
      <div className="reading-vinyl">
        <Record song={m.song} playing={playing} />
        <div className="reading-controls">
          <button
            aria-label={m.liked ? "Unlike moment" : "Like moment"}
            aria-pressed={m.liked}
            onClick={like}
          >
            <Heart size={20} fill={m.liked ? "currentColor" : "none"} />
          </button>
          <button
            aria-label={playing ? "Pause record" : "Play record"}
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
          <p>The song ends. The moment stays.</p>
          <small>RAMBLING · A PRIVATE PRESSING</small>
        </footer>
      </article>
    </main>
  );
}
