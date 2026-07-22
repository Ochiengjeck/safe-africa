"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Quote, Link2, Undo2, Redo2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  /** Form field name the HTML is submitted under. */
  name: string;
  defaultValue?: string;
};

function ToolbarButton({ icon: Icon, label, active, onClick, disabled }: { icon: LucideIcon; label: string; active?: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40",
        active && "bg-primary/10 text-primary"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />;

/** Tiptap editor that mirrors its HTML into a hidden input for server-action forms. */
export function RichTextEditor({ name, defaultValue }: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue ?? "");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
    ],
    content: defaultValue ?? "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-neutral dark:prose-invert max-w-none min-h-40 rounded-b-md border border-t-0 border-input bg-transparent px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      },
    },
    onUpdate({ editor }) {
      setHtml(editor.getHTML());
    },
  });

  function setLink(e: Editor) {
    const previous = e.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      e.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-input bg-muted/40 p-1">
        <ToolbarButton icon={Bold} label="Bold" active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} />
        <ToolbarButton icon={Italic} label="Italic" active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <Divider />
        <ToolbarButton icon={Heading2} label="Heading" active={editor?.isActive("heading", { level: 2 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} />
        <ToolbarButton icon={Heading3} label="Subheading" active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} />
        <Divider />
        <ToolbarButton icon={List} label="Bullet list" active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <ToolbarButton icon={ListOrdered} label="Numbered list" active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />
        <ToolbarButton icon={Quote} label="Quote" active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} />
        <ToolbarButton icon={Link2} label="Link" active={editor?.isActive("link")} onClick={() => editor && setLink(editor)} />
        <Divider />
        <ToolbarButton icon={Undo2} label="Undo" onClick={() => editor?.chain().focus().undo().run()} disabled={!editor?.can().undo()} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={() => editor?.chain().focus().redo().run()} disabled={!editor?.can().redo()} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
