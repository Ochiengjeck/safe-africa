import { Resend } from "resend";

const FROM = "SAFE Africa Website <onboarding@resend.dev>";

/**
 * Sends a notification email via Resend. When RESEND_API_KEY is unset the
 * message is logged to the server console instead, so local development and
 * deployments without email keep working.
 */
export async function sendNotification(subject: string, html: string) {
  const to = process.env.NOTIFICATION_EMAIL || "info@safeafrika.com";
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(`[email disabled] To: ${to} — ${subject}\n${html}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (error) {
    // Notification failure must never break the user-facing action.
    console.error("Failed to send notification email:", error);
  }
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
