import { useEffect, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Disc3 } from "lucide-react";
import { songs, seedMoments, localizeStoredMoment } from "./data/demo";
import type { Moment } from "./types";
import {
  createMoment,
  STORAGE_KEY,
  upsertMoment,
  validMoments,
} from "./store/moments";
import { Player } from "./pages/Player";
import { Editor } from "./pages/Editor";
import { Reading } from "./pages/Reading";
import { Collection } from "./pages/Collection";
import { Record } from "./components/Vinyl";
type Route = { page: "player" | "home" | "edit" | "read"; id?: string };
function route(): Route {
  const [page, id] = location.hash.slice(1).split("/");
  return ["home", "read"].includes(page)
    ? { page: page as Route["page"], id }
    : { page: "player" };
}
export default function App() {
  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      return validMoments(data)
        ? data.map(localizeStoredMoment)
        : seedMoments();
    } catch {
      return seedMoments();
    }
  });
  const [nav, setNav] = useState<Route>(route);
  const [draft, setDraft] = useState<Moment | null>(null);
  const [songIndex, setSongIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(42);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [tab, setTab] = useState(0);
  const [toast, setToast] = useState("");
  const pager = useRef<HTMLDivElement>(null);
  const song = songs[songIndex];
  function go(page: Route["page"], id?: string) {
    if (page === "edit") {
      setNav({ page, id });
    } else {
      location.hash = page + (id ? "/" + id : "");
      setNav({ page, id });
    }
    window.scrollTo(0, 0);
  }
  useEffect(() => {
    const handle = () => {
      setNav(route());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", handle);
    return () => window.removeEventListener("hashchange", handle);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setProgress((p) => Math.min(p + 1, song.duration)),
      1000,
    );
    return () => clearInterval(timer);
  }, [playing, song.duration]);
  useEffect(() => {
    if (progress < song.duration) return;
    setProgress(0);
    if (!repeat) setSongIndex((i) => (i + 1) % songs.length);
  }, [progress, song.duration, repeat]);
  useEffect(() => {
    if (nav.page === "read") {
      const m = moments.find((x) => x.id === nav.id);
      if (m) {
        setSongIndex(
          Math.max(
            0,
            songs.findIndex((s) => s.id === m.song.id),
          ),
        );
        setRepeat(true);
      }
    }
  }, [nav.page, nav.id]);
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY))
        localStorage.setItem(STORAGE_KEY, JSON.stringify(moments));
    } catch {}
  }, []);
  useEffect(() => {
    const pages = pager.current?.children;
    if (pages)
      Array.from(pages).forEach((el, i) => {
        (el as HTMLElement).inert = i !== tab;
      });
  }, [tab, nav.page]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  function persist(items: Moment[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      setMoments(items);
      return true;
    } catch {
      return false;
    }
  }
  function save(m: Moment) {
    if (!persist(upsertMoment(moments, m))) return false;
    setDraft(null);
    setTab(1);
    go("home");
    setToast("此刻，已刻进黑胶。");
    return true;
  }
  function open(m: Moment) {
    setSongIndex(
      Math.max(
        0,
        songs.findIndex((s) => s.id === m.song.id),
      ),
    );
    setRepeat(true);
    setPlaying(true);
    setProgress(0);
    go("read", m.id);
  }
  function switchTab(t: number) {
    setTab(t);
    pager.current?.scrollTo({
      left: pager.current.clientWidth * t,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  useEffect(() => {
    if (nav.page === "home" && pager.current)
      pager.current.scrollLeft = pager.current.clientWidth * tab;
  }, [nav.page]);
  const current = moments.find((m) => m.id === nav.id);
  return (
    <MotionConfig reducedMotion="user">
      <div className="desktop-note">
        <span className="brand">rambling</span>
        <p>
          把心情，刻成唱片。
          <br />
          留一个可以回来的地方。
        </p>
        <span className="desktop-bottom">
          第一辑
          <br />
          音乐 → 此刻 → 回忆
        </span>
      </div>
      <div className="app-shell">
        {nav.page === "player" ? (
          <Player
            song={song}
            playing={playing}
            toggle={() => setPlaying(!playing)}
            next={(n) => {
              setSongIndex(
                (i) =>
                  (i +
                    (shuffle
                      ? 1 + Math.floor(Math.random() * (songs.length - 1))
                      : n) +
                    songs.length) %
                  songs.length,
              );
              setProgress(0);
            }}
            progress={progress}
            seek={setProgress}
            enter={() => go("home")}
            repeat={repeat}
            setRepeat={() => setRepeat(!repeat)}
            shuffle={shuffle}
            setShuffle={() => setShuffle(!shuffle)}
          />
        ) : nav.page === "edit" && draft ? (
          <Editor
            key={draft.id}
            initial={draft}
            save={save}
            cancel={() => {
              setDraft(null);
              go(current ? "read" : "home", current?.id);
            }}
          />
        ) : nav.page === "read" && current ? (
          <Reading
            moment={current}
            playing={playing}
            toggle={() => setPlaying(!playing)}
            back={() => {
              setTab(1);
              go("home");
            }}
            edit={() => {
              setDraft(current);
              go("edit", current.id);
            }}
            like={() => {
              if (
                !persist(
                  upsertMoment(moments, { ...current, liked: !current.liked }),
                )
              )
                setToast("暂时无法保存，请稍后重试。");
            }}
          />
        ) : (
          <main className="home">
            <header className="page-top">
              <button aria-label="返回播放器" onClick={() => go("player")}>
                <ArrowLeft />
              </button>
              <span className="wordmark">rambling</span>
              <Disc3 size={19} />
            </header>
            <div className="home-tabs">
              <button
                className={tab === 0 ? "selected" : ""}
                onClick={() => switchTab(0)}
              >
                制作黑胶
              </button>
              <button
                className={tab === 1 ? "selected" : ""}
                onClick={() => switchTab(1)}
              >
                我的黑胶 <small>{moments.length}</small>
              </button>
            </div>
            <div
              className="home-pager"
              ref={pager}
              onScroll={(e) => {
                const el = e.currentTarget;
                const t = Math.round(el.scrollLeft / el.clientWidth);
                if (t !== tab) setTab(t);
              }}
            >
              <section className="create-page">
                <div className="create-heading">
                  <span className="eyebrow">有些歌，会成为一个地方。</span>
                  <h1>
                    留住一点
                    <br />
                    <em>此时此刻。</em>
                  </h1>
                  <p>今天，这首歌带给你什么感觉？</p>
                </div>
                <button
                  className="create-art"
                  aria-label="记录此刻"
                  onClick={() => {
                    setDraft(createMoment(song));
                    setRepeat(true);
                    go("edit");
                  }}
                >
                  <Record song={song} />
                  <div className="blank-sleeve">
                    <small>
                      RAMBLING
                      <br />
                      私人珍藏
                    </small>
                    <span className="handwritten">
                      把这份心情，
                      <br />
                      留在唱片里。
                    </span>
                    <span className="sleeve-star">✳</span>
                    <div className="sleeve-rule">
                      A 面 <span>你的此刻</span>
                    </div>
                  </div>
                  <div className="paper-ticket">
                    一首歌
                    <br />
                    一小段生活
                  </div>
                </button>
                <div className="current-soundtrack">
                  <img src={song.artwork} alt="" />
                  <div>
                    <small>此刻，正在听</small>
                    <strong>{song.title}</strong>
                    <span>{song.artist}</span>
                  </div>
                  <span className={`equalizer ${playing ? "playing" : ""}`}>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    setDraft(createMoment(song));
                    setRepeat(true);
                    go("edit");
                  }}
                >
                  记录此刻 <ArrowUpRight size={20} />
                </button>
                <p className="footnote">
                  几句话，一种心情，一张留给自己的唱片。
                </p>
              </section>
              <section className="collection-page">
                <Collection moments={moments} open={open} />
              </section>
            </div>
          </main>
        )}
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
      <div className="desktop-caption">
        <span>静静听。</span>
        <p>
          在一首歌
          <br />
          和一段回忆之间。
        </p>
        <div className="tiny-record">◉</div>
        <span>你的私人唱片柜</span>
      </div>
    </MotionConfig>
  );
}
