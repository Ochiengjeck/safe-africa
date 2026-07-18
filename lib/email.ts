import { Resend } from "resend";

// Until a domain is verified at resend.com/domains, Resend only accepts the
// onboarding@resend.dev sender and only delivers to the account owner's email.
// After verifying safeafrika.com, set EMAIL_FROM (e.g. "SAFE Africa <website@safeafrika.com>").
const FROM = process.env.EMAIL_FROM || "SAFE Africa Website <onboarding@resend.dev>";

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
