function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Converts legacy plain text into editor-compatible HTML: blank lines become
 * separate paragraphs, single newlines become <br>. Idempotent — text that
 * already contains HTML tags is returned unchanged. Shared by the seed and the
 * one-off migration so content stays consistent.
 */
export function plainTextToHtml(text: string | null | undefined): string {
  if (!text) return "";
  if (/<[a-z][\s\S]*>/i.test(text)) return text; // already HTML
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return "";
  return paragraphs.map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join("");
}
