import { Fragment, type ReactNode } from "react";
import { richDocument, highlightColors } from "../utils/richDocument";
import type { Moment, RichNode } from "../types";
export function DiaryHeader({ date }: { date: string }) {
  const d = new Date(date);
  return (
    <header className="diary-header">
      <div className="date-main">
        <span className="day">{d.getDate().toString().padStart(2, "0")}</span>
        <div className="month">{d.getMonth() + 1}月</div>
        <div className="year">{d.getFullYear()}年</div>
      </div>
      <div className="time-box">
        <span>
          {d.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </span>
        <hr />
        <span>{d.toLocaleDateString("zh-CN", { weekday: "long" })}</span>
      </div>
    </header>
  );
}
function renderNode(node: RichNode, key: number): ReactNode {
  if (node.type === "text") {
    let text: ReactNode = node.text || "";
    for (const mark of node.marks || []) {
      if (mark.type === "bold") text = <strong>{text}</strong>;
      if (mark.type === "italic") text = <em>{text}</em>;
      if (mark.type === "underline") text = <u>{text}</u>;
      if (mark.type === "strike") text = <s>{text}</s>;
      if (mark.type === "highlight")
        text = (
          <mark
            style={{
              backgroundColor:
                highlightColors.find((c) => c.color === mark.attrs?.color)
                  ?.color || "#e3d3ae",
            }}
          >
            {text}
          </mark>
        );
    }
    return <Fragment key={key}>{text}</Fragment>;
  }
  const children = node.content?.map(renderNode);
  if (node.type === "image") {
    const src = String(node.attrs?.src || "");
    if (
      !/^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/|artwork\/)/i.test(
        src,
      )
    )
      return null;
    return (
      <figure key={key}>
        <img src={src} alt="A photograph from this moment" />
      </figure>
    );
  }
  if (node.type === "hardBreak") return <br key={key} />;
  if (node.type === "bulletList") return <ul key={key}>{children}</ul>;
  if (node.type === "orderedList")
    return (
      <ol key={key} start={Number(node.attrs?.start) || 1}>
        {children}
      </ol>
    );
  if (node.type === "listItem") return <li key={key}>{children}</li>;
  if (node.type === "blockquote")
    return <blockquote key={key}>{children}</blockquote>;
  if (node.type === "paragraph") return <p key={key}>{children || <br />}</p>;
  return <Fragment key={key}>{children}</Fragment>;
}
export function DiaryContent({ moment: m }: { moment: Moment }) {
  return (
    <div className="diary-content notes-reading sans">
      {m.title && <h2>{m.title}</h2>}
      {richDocument(m).content?.map(renderNode)}
    </div>
  );
}
