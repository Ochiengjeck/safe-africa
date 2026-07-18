"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

type RichTextEditorProps = {
  /** Form field name the HTML is submitted under. */
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

const BUTTONS: { label: string; isActive: string; command: (editor: NonNullable<ReturnType<typeof useEditor>>) => void }[] = [
  { label: "B", isActive: "bold", command: (e) => e.chain().focus().toggleBold().run() },
  { label: "I", isActive: "italic", command: (e) => e.chain().focus().toggleItalic().run() },
  { label: "H2", isActive: "heading", command: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: "H3", isActive: "heading3", command: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: "• List", isActive: "bulletList", command: (e) => e.chain().focus().toggleBulletList().run() },
  { label: "1. List", isActive: "orderedList", command: (e) => e.chain().focus().toggleOrderedList().run() },
];

/** Tiptap editor that mirrors its HTML into a hidden input for server-action forms. */
export function RichTextEditor({ name, defaultValue }: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-32 rounded-md border border-input bg-transparent px-3 py-2 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  return (
    <div className="space-y-1.5">
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap gap-1">
        {BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            className="rounded border border-input px-2 py-0.5 text-xs font-medium hover:bg-accent"
            onClick={() => editor && button.command(editor)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
