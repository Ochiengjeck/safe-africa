import { escapeHtml } from "@/lib/email";

/**
 * Applicant- and candidate-facing email templates. Each builder returns
 * { subject, html }. All interpolation goes through `esc`. The markup is
 * table-based with inline styles for broad email-client compatibility
 * (Gmail, Outlook, Apple Mail).
 */

const SITE_URL = (process.env.SITE_URL || "https://safeafrika.com").replace(/\/$/, "");
const esc = escapeHtml;

// Brand palette
const GREEN = "#1a5632";
const DARK = "#16301d";
const INK = "#1c231d";
const MUTED = "#5c6357";
const BG = "#f4f6f2";
const BORDER = "#e2e6da";

const ORG_LEGAL = "Smart Agriculture and Food Economics Africa Ltd";
const ORG_ADDRESS = "Greenhouse Mall, Ngong Road, Nairobi, Kenya";
const ORG_EMAIL = "info@safeafrika.com";

type Block = string;

const p = (html: string): Block =>
  `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${INK};">${html}</p>`;

const lead = (html: string): Block =>
  `<p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${INK};">${html}</p>`;

const small = (html: string): Block =>
  `<p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:${MUTED};">${html}</p>`;

function button(label: string, href: string): Block {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
    <tr><td style="border-radius:8px;background:${GREEN};">
      <a href="${href}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${esc(label)}</a>
    </td></tr>
  </table>`;
}

function callout(title: string, rows: [string, string][]): Block {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 0;font-size:13px;color:${MUTED};width:130px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:8px 0;font-size:15px;color:${INK};font-weight:600;vertical-align:top;">${esc(value)}</td>
        </tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border:1px solid ${BORDER};border-radius:10px;background:#fbfcf9;">
    <tr><td style="padding:16px 20px 4px;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${GREEN};">${esc(title)}</td></tr>
    <tr><td style="padding:0 20px 12px;"><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${body}</table></td></tr>
  </table>`;
}

const signature: Block = `${p(`Warm regards,`)}
  <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${INK};">The SAFE Africa Recruitment Team</p>
  <p style="margin:0 0 16px;font-size:13px;color:${MUTED};">${esc(ORG_LEGAL)}</p>`;

/** Wraps content blocks in the full branded email shell. */
function layout(opts: { preheader: string; heading: string; body: Block }): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:${BG};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(opts.preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${BG};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${BORDER};border-radius:14px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:${DARK};padding:22px 28px;">
          <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:19px;font-weight:700;letter-spacing:-.02em;color:#ffffff;">SAFE Africa</span>
          <span style="font-family:'Segoe UI',Arial,sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#d9a41b;padding-left:10px;">Careers</span>
        </td></tr>
        <!-- Evidence-bar accent -->
        <tr><td style="height:4px;font-size:0;line-height:0;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
            <td width="25%" style="height:4px;background:#d9a41b;"></td>
            <td width="25%" style="height:4px;background:#e8771d;"></td>
            <td width="25%" style="height:4px;background:#4d9a3f;"></td>
            <td width="25%" style="height:4px;background:#2a6bb5;"></td>
          </tr></table>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:30px 28px 12px;font-family:'Segoe UI',Arial,sans-serif;">
          <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${DARK};">${esc(opts.heading)}</h1>
          ${opts.body}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 28px;background:${BG};border-top:1px solid ${BORDER};font-family:'Segoe UI',Arial,sans-serif;">
          <p style="margin:0 0 4px;font-size:12px;color:${MUTED};">${esc(ORG_LEGAL)}</p>
          <p style="margin:0 0 4px;font-size:12px;color:${MUTED};">${esc(ORG_ADDRESS)}</p>
          <p style="margin:0;font-size:12px;color:${MUTED};">
            <a href="mailto:${ORG_EMAIL}" style="color:${GREEN};text-decoration:none;">${ORG_EMAIL}</a>
            &nbsp;·&nbsp;
            <a href="${SITE_URL}" style="color:${GREEN};text-decoration:none;">safeafrika.com</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:11px;color:${MUTED};font-family:'Segoe UI',Arial,sans-serif;">This is an automated message from the SAFE Africa recruitment system.</p>
    </td></tr>
  </table>
</body></html>`;
}

// ——— Templates ———

export function applicationReceived(name: string, vacancyTitle: string) {
  const t = esc(vacancyTitle);
  return {
    subject: `Application received — ${vacancyTitle}`,
    html: layout({
      preheader: `We've received your application for ${vacancyTitle}. Here's what happens next.`,
      heading: "Thank you for your application",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`Thank you for applying for the <strong>${t}</strong> position at SAFE Africa. This email confirms that your application has been received and safely recorded in our system.`) +
        p(`Our team carefully reviews every submission against the requirements of the role. If your profile matches what we are looking for, a member of our recruitment team will reach out to you with the next steps.`) +
        small(`Please note: we acknowledge all applications, but due to the volume received we are only able to contact shortlisted candidates directly. We appreciate your patience during the review period.`) +
        button("Explore more opportunities", `${SITE_URL}/careers`) +
        signature,
    }),
  };
}

export function applicationShortlisted(name: string, vacancyTitle: string) {
  const t = esc(vacancyTitle);
  return {
    subject: `You've been shortlisted — ${vacancyTitle}`,
    html: layout({
      preheader: `Good news about your application for ${vacancyTitle}.`,
      heading: "You've been shortlisted",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`We are pleased to let you know that, following an initial review, you have been <strong>shortlisted</strong> for the <strong>${t}</strong> position at SAFE Africa. Congratulations — this reflects the strength of your profile against a competitive field.`) +
        p(`A member of our recruitment team will be in touch shortly to arrange the next stage, which may include an interview or a short assessment. To help things move smoothly, please keep an eye on both your inbox and your phone over the coming days.`) +
        small(`If any of your contact details have changed, simply reply to this email and let us know.`) +
        signature,
    }),
  };
}

export function applicationRejected(name: string, vacancyTitle: string) {
  const t = esc(vacancyTitle);
  return {
    subject: `Update on your application — ${vacancyTitle}`,
    html: layout({
      preheader: `An update regarding your SAFE Africa application.`,
      heading: "An update on your application",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`Thank you for your interest in the <strong>${t}</strong> position at SAFE Africa, and for the time and effort you invested in your application.`) +
        p(`After careful consideration, we have decided not to move forward with your application on this occasion. This decision was not easy — we received many strong applications, and it does not diminish your qualifications or experience.`) +
        p(`We would genuinely like to stay in touch. By joining our talent pool, you'll be among the first to hear about future roles that match your expertise, and you can be considered directly when new opportunities arise.`) +
        button("Join our talent pool", `${SITE_URL}/careers/talent-pool`) +
        p(`We wish you every success in your career and hope our paths cross again.`) +
        signature,
    }),
  };
}

export function interviewScheduled(opts: {
  name: string;
  position: string;
  whenText: string;
  mode: string;
  locationOrLink?: string | null;
  notes?: string | null;
}) {
  return {
    subject: `Interview invitation — ${opts.position}`,
    html: layout({
      preheader: `Your interview for ${opts.position} is confirmed — details inside.`,
      heading: "You're invited to an interview",
      body:
        lead(`Dear ${esc(opts.name)},`) +
        p(`Thank you for your continued interest in the <strong>${esc(opts.position)}</strong> role at SAFE Africa. We would be delighted to meet with you. Please find the details of your interview below.`) +
        callout("Interview details", [
          ["Position", opts.position],
          ["Date & time", opts.whenText],
          ["Format", opts.mode],
          ["Where", opts.locationOrLink || ""],
        ]) +
        (opts.notes ? p(esc(opts.notes)) : "") +
        p(`Kindly <strong>reply to this email to confirm your attendance</strong>. If the proposed time is not convenient, let us know your availability and we will do our best to accommodate you.`) +
        small(`We recommend joining or arriving a few minutes early. If it is a video call, please test your camera and microphone beforehand.`) +
        signature,
    }),
  };
}

export function offerSent(name: string, position: string, offerNotes?: string | null) {
  return {
    subject: `Job offer — ${position} at SAFE Africa`,
    html: layout({
      preheader: `We'd like to offer you the ${position} role at SAFE Africa.`,
      heading: "We'd like to offer you the role",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`Congratulations! Following your interview, we were highly impressed and are delighted to formally offer you the <strong>${esc(position)}</strong> position at SAFE Africa.`) +
        (offerNotes ? callout("Offer details", [["Details", offerNotes]]) : "") +
        p(`Please <strong>reply to this email to indicate whether you accept this offer</strong>. Once we hear from you, a member of our team will follow up with the formal contract, onboarding schedule, and any documentation required to get you started.`) +
        p(`We are excited about the prospect of you joining our team and contributing to evidence that improves livelihoods across Africa.`) +
        signature,
    }),
  };
}

export function talentPoolWelcome(name: string) {
  return {
    subject: "Welcome to the SAFE Africa talent pool",
    html: layout({
      preheader: "Your profile is now in the SAFE Africa talent pool.",
      heading: "Welcome to our talent pool",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`Thank you for registering your profile with SAFE Africa. You are now part of our <strong>talent pool</strong> — a network of skilled professionals we turn to first when new opportunities arise.`) +
        p(`Here's what that means for you:`) +
        `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:${INK};">
          <li>We'll email you as soon as a new opening matches your expertise.</li>
          <li>You may be invited directly to interview for suitable roles.</li>
          <li>Your details stay on file securely and are used only for recruitment purposes.</li>
        </ul>` +
        p(`You can update your profile at any time by submitting the talent pool form again using this same email address.`) +
        button("View current openings", `${SITE_URL}/careers`) +
        signature,
    }),
  };
}

export function newOpeningNotice(name: string, vacancyTitle: string, slug: string) {
  const t = esc(vacancyTitle);
  return {
    subject: `New opening at SAFE Africa — ${vacancyTitle}`,
    html: layout({
      preheader: `A new SAFE Africa opening may match your profile: ${vacancyTitle}.`,
      heading: "A new opportunity for you",
      body:
        lead(`Dear ${esc(name)},`) +
        p(`As a valued member of our talent pool, we wanted you to be among the first to know: SAFE Africa is now hiring for the <strong>${t}</strong> position.`) +
        p(`If this role aligns with your experience and interests, we warmly encourage you to review the full details and submit your application.`) +
        button("View the role & apply", `${SITE_URL}/careers/${esc(slug)}`) +
        small(`Not the right fit this time? No action is needed — we'll continue to notify you whenever a matching opportunity opens up.`) +
        signature,
    }),
  };
}
