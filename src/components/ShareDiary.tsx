import { useEffect, useRef, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import type { Moment } from "../types";
import { DiaryHeader, DiaryContent } from "./Diary";
import { Player } from "../pages/Player";
import {
  exportDiary,
  downloadImages,
  type ShareImage,
} from "../utils/shareImages";
export function ShareDiary({
  moment,
  playing,
  progress,
  close,
}: {
  moment: Moment;
  playing: boolean;
  progress: number;
  close: () => void;
}) {
  const diary = useRef<HTMLDivElement>(null),
    player = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const [images, setImages] = useState<ShareImage[]>([]);
  const [status, setStatus] = useState("Preparing your pages…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [attempt, retry] = useState(0);
  const [snapshot] = useState({ playing, progress });
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    let generated: ShareImage[] = [];
    setBusy(true);
    setError("");
    // A frame lets the export surface finish layout before measuring its lines.
    const frame = requestAnimationFrame(() => {
      exportDiary(
        diary.current!,
        player.current!,
        (message) => {
          if (!cancelled) setStatus(message);
        },
        controller.signal,
      )
        .then((result) => {
          generated = result;
          if (cancelled) result.forEach((i) => URL.revokeObjectURL(i.url));
          else {
            setImages(result);
            setBusy(false);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e.message);
            setBusy(false);
          }
        });
    });
    return () => {
      cancelled = true;
      controller.abort();
      cancelAnimationFrame(frame);
      generated.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, [attempt]);
  const canShare =
    images.length > 0 &&
    !!navigator.canShare?.({ files: images.map((i) => i.file) });
  async function share() {
    try {
      await navigator.share({
        files: images.map((i) => i.file),
        title: moment.title || "A Rambling moment",
      });
    } catch (e) {
      if ((e as Error).name !== "AbortError")
        setError(
          "Sharing was not available. You can download the images instead.",
        );
    }
  }
  const noop = () => {};
  return (
    <>
      <dialog
        ref={dialog}
        className="share-dialog"
        aria-labelledby="share-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <header>
          <div>
            <small>A MOMENT TO PASS ALONG</small>
            <h2 id="share-title">Share your diary</h2>
          </div>
          <button onClick={close} aria-label="Close share preview">
            <X />
          </button>
        </header>
        <p>Your diary in phone-sized pages. The soundtrack comes last.</p>
        {busy && <p role="status">{status}</p>}
        {error && <p role="alert">{error}</p>}
        {!busy && !images.length && (
          <button onClick={() => retry((n) => n + 1)}>Try again</button>
        )}
        {!!images.length && (
          <>
            <div className="share-previews">
              {images.map((image, i) => (
                <a
                  key={image.file.name}
                  href={image.url}
                  download={image.file.name}
                >
                  <img
                    src={image.url}
                    alt={
                      i === images.length - 1
                        ? "Soundtrack page preview"
                        : `Diary page ${i + 1} preview`
                    }
                  />
                  <span>
                    {i + 1} / {images.length}
                    {i === images.length - 1 ? " · Soundtrack" : ""}
                  </span>
                </a>
              ))}
            </div>
            <div className="share-actions">
              <button
                className="primary"
                onClick={() =>
                  void downloadImages(images).catch(() =>
                    setError("Download failed. Try saving each image above."),
                  )
                }
              >
                <Download size={18} /> Download image set
              </button>
              {canShare && (
                <button className="primary" onClick={() => void share()}>
                  <Share2 size={18} /> Share to apps
                </button>
              )}
            </div>
            <p className="footnote">
              {canShare
                ? "Choose an app in your device’s share sheet."
                : "Tap a preview to save one image, or download the complete ZIP."}
            </p>
          </>
        )}
      </dialog>
      <div
        className="share-render"
        aria-hidden="true"
        ref={(el) => {
          el?.setAttribute("inert", "");
        }}
      >
        <div ref={diary} className="share-diary diary-paper">
          <div className="share-brand">RAMBLING · A PRIVATE PRESSING</div>
          <DiaryHeader date={moment.createdAt} />
          {moment.mood && (
            <p className="reading-mood">
              {moment.mood.emoji} {moment.mood.label}
            </p>
          )}
          <DiaryContent moment={moment} />
        </div>
        <div ref={player} className="share-player">
          <Player
            song={moment.song}
            playing={snapshot.playing}
            progress={Math.min(snapshot.progress, moment.song.duration)}
            toggle={noop}
            next={noop}
            seek={noop}
            enter={noop}
            repeat={true}
            setRepeat={noop}
            shuffle={false}
            setShuffle={noop}
          />
        </div>
      </div>
    </>
  );
}
