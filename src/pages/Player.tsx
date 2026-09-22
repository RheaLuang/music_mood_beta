import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Repeat2,
  Shuffle,
  Disc3,
} from "lucide-react";
import type { Song } from "../types";
export function Player({
  song,
  playing,
  toggle,
  next,
  progress,
  seek,
  enter,
  repeat,
  setRepeat,
  shuffle,
  setShuffle,
}: {
  song: Song;
  playing: boolean;
  toggle: () => void;
  next: (n: number) => void;
  progress: number;
  seek: (n: number) => void;
  enter: () => void;
  repeat: boolean;
  setRepeat: () => void;
  shuffle: boolean;
  setShuffle: () => void;
}) {
  const clock = (n: number) =>
    `${Math.floor(n / 60)}:${Math.floor(n % 60)
      .toString()
      .padStart(2, "0")}`;
  return (
    <main className="player">
      <header className="player-top">
        <Disc3 size={20} />
        <span>Now playing</span>
        <span className="small">DEMO</span>
      </header>
      <div className="album">
        <img src={song.artwork} alt={`${song.album} by ${song.artist}`} />
        <div className="album-title">
          <span>{song.artist}</span>
          <strong>{song.album}</strong>
        </div>
      </div>
      <div className="song-info">
        <div>
          <h1>{song.title}</h1>
          <p>{song.artist}</p>
        </div>
        <button
          className="rambling-entry"
          onClick={enter}
          aria-label="Open Rambling"
        >
          <Disc3 size={16} /> Rambling <span>↗</span>
        </button>
      </div>
      <div className="progress">
        <input
          aria-label="Playback position"
          type="range"
          min="0"
          max={song.duration}
          value={progress}
          onChange={(e) => seek(+e.target.value)}
        />
        <div>
          <span>{clock(progress)}</span>
          <span>{clock(song.duration)}</span>
        </div>
      </div>
      <div className="playback">
        <button
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={setShuffle}
          className={shuffle ? "active" : ""}
        >
          <Shuffle size={20} />
        </button>
        <button aria-label="Previous track" onClick={() => next(-1)}>
          <SkipBack fill="currentColor" />
        </button>
        <button
          className="play-main"
          aria-label={playing ? "Pause" : "Play"}
          onClick={toggle}
        >
          {playing ? (
            <Pause fill="currentColor" />
          ) : (
            <Play fill="currentColor" />
          )}
        </button>
        <button aria-label="Next track" onClick={() => next(1)}>
          <SkipForward fill="currentColor" />
        </button>
        <button
          aria-label="Repeat track"
          aria-pressed={repeat}
          className={repeat ? "active" : ""}
          onClick={setRepeat}
        >
          <Repeat2 size={20} />
        </button>
      </div>
      <div className="player-bottom">
        <span className="small">The world can wait until the last note.</span>
      </div>
      <p className="demo-note">Fictional tracks · Simulated playback</p>
    </main>
  );
}
