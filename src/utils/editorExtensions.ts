import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
export const diaryExtensions = () => [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
    code: false,
    link: false,
    horizontalRule: false,
  }),
  Highlight.configure({ multicolor: true }),
  Image.configure({ allowBase64: true }),
  Placeholder.configure({
    placeholder: "Start anywhere. Even a half-formed thought belongs here.",
  }),
];
