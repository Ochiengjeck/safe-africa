/**
 * Renders admin-authored rich text (HTML produced by the Tiptap editor).
 * Content is trusted: only authenticated admins can write it.
 */
export function RichTextContent({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className ?? "prose prose-neutral dark:prose-invert max-w-none"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
