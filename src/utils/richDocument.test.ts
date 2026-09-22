// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { Editor } from "@tiptap/core";
import { diaryExtensions } from "./editorExtensions";
import { richDocument, withDocument } from "./richDocument";
import { seedMoments } from "../data/demo";
import { validMoments } from "../store/moments";
let editor: Editor;
afterEach(() => editor?.destroy());
function create(content = "<p>First line</p><p>Second line</p>") {
  editor = new Editor({ extensions: diaryExtensions(), content });
  return editor;
}
describe("Notes-style editing", () => {
  it("formats across paragraphs and preserves multiple independent highlight colors on reload", () => {
    create();
    editor.chain().setTextSelection({ from: 1, to: 23 }).toggleBold().run();
    editor
      .chain()
      .setTextSelection({ from: 1, to: 6 })
      .setHighlight({ color: "#c3cdb8" })
      .run();
    editor
      .chain()
      .setTextSelection({ from: 13, to: 19 })
      .setHighlight({ color: "#dfc0bc" })
      .run();
    const saved = JSON.parse(
      JSON.stringify(
        withDocument(seedMoments()[0], editor.getJSON(), editor.getText()),
      ),
    );
    expect(validMoments([saved])).toBe(true);
    editor.commands.setContent(richDocument(saved));
    const html = editor.getHTML();
    expect(html).toContain("<strong>");
    expect(html).toContain('data-color="#c3cdb8"');
    expect(html).toContain('data-color="#dfc0bc"');
    expect(editor.getText()).toContain("Second line");
    editor.chain().setTextSelection({ from: 1, to: 6 }).unsetHighlight().run();
    expect(editor.getHTML()).not.toContain('data-color="#c3cdb8"');
    expect(editor.getHTML()).toContain('data-color="#dfc0bc"');
  });
  it("splits and joins paragraphs naturally and supports undo and redo", () => {
    create("<p>Hello world</p>");
    editor.chain().setTextSelection(6).splitBlock().run();
    expect(editor.getJSON().content).toHaveLength(2);
    editor.commands.joinBackward();
    expect(editor.getText()).toBe("Hello world");
    editor.commands.undo();
    expect(editor.getText()).toBe("Hello world");
    editor.commands.redo();
    expect(editor.getText()).toBe("Hello world");
  });
  it("replaces a cross-paragraph selection and undo restores the original text", () => {
    create();
    editor
      .chain()
      .setTextSelection({ from: 7, to: 19 })
      .insertContent(" / ")
      .run();
    expect(editor.getText()).toBe("First  /  line");
    editor.commands.undo();
    expect(editor.getText()).toBe("First line\n\nSecond line");
    editor.commands.redo();
    expect(editor.getText()).toBe("First  /  line");
  });
  it("inserts a photo between text, retains following editable text, and survives persistence", () => {
    create("<p>BeforeAfter</p>");
    editor
      .chain()
      .setTextSelection(7)
      .setImage({ src: "data:image/png;base64,AA" })
      .run();
    const content = editor.getJSON().content!;
    expect(content.map((n) => n.type)).toEqual([
      "paragraph",
      "image",
      "paragraph",
    ]);
    expect(content[0].content?.[0]).toMatchObject({ text: "Before" });
    expect(content[2].content?.[0]).toMatchObject({ text: "After" });
    const m = withDocument(
      seedMoments()[0],
      editor.getJSON(),
      editor.getText(),
    );
    expect(m.photos).toEqual([]);
    expect(JSON.stringify(m).match(/data:image\/png/g)).toHaveLength(1);
  });
  it("supports lists and removes selected images with a normal delete operation", () => {
    create("<p>One</p><p>Two</p>");
    editor
      .chain()
      .setTextSelection({ from: 1, to: 9 })
      .toggleBulletList()
      .run();
    expect(editor.getJSON().content?.[0].type).toBe("bulletList");
    editor.commands.toggleBulletList();
    expect(editor.getJSON().content?.[0].type).toBe("paragraph");
    editor
      .chain()
      .setTextSelection(4)
      .setImage({ src: "artwork/sea.jpg" })
      .run();
    editor.commands.deleteSelection();
    expect(editor.getHTML()).not.toContain("<img");
    expect(editor.getText()).toContain("One");
  });
  it("rejects malformed rich documents without accepting them as valid stored notes", () => {
    expect(
      validMoments([
        { ...seedMoments()[0], document: { type: "doc", content: [null] } },
      ]),
    ).toBe(false);
  });
  it("migrates older diaries without losing text, photos, stickers or highlighted text", () => {
    const original = seedMoments()[0];
    editor = new Editor({
      extensions: diaryExtensions(),
      content: richDocument(original),
    });
    expect(editor.getText()).toContain(original.body.split("\n")[0]);
    expect(editor.getHTML()).toContain("artwork/sea.jpg");
    expect(editor.getText()).toContain("✺");
    expect(editor.getHTML()).toContain("getting something back");
  });
});
