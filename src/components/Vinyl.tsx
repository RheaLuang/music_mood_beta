import type { Moment, Song } from "../types";
export function Record({
  song,
  playing = false,
}: {
  song: Song;
  playing?: boolean;
}) {
  return (
    <div
      className="record"
      style={{ animationPlayState: playing ? "running" : "paused" }}
    >
      <div className="record-label">
        <img src={song.artwork} alt={`${song.album} record label`} />
        <i />
      </div>
    </div>
  );
}
export function Sleeve({ moment }: { moment: Moment }) {
  return (
    <div
      className={`sleeve ${moment.sleeveImage ? "original custom-cover" : moment.sleeve}`}
    >
      <img
        src={moment.sleeveImage || moment.song.artwork}
        alt={`${moment.song.album} sleeve`}
      />
      <div className="sleeve-copy">
        <small>
          RAMBLING /{" "}
          {new Date(moment.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </small>
        <strong>{moment.title || moment.song.title}</strong>
        <span>{moment.song.artist}</span>
      </div>
      {moment.mood && (
        <span
          className="mood-tab"
          style={{ background: moment.mood.color }}
          title={moment.mood.label}
        >
          {moment.mood.emoji}
          <span>{moment.mood.label}</span>
        </span>
      )}
    </div>
  );
}
