import { escapeHtml } from "@/lib/email";

/**
 * Applicant- and candidate-facing email templates. Each builder returns
 * { subject, html }. Values are escaped; keep interpolation inside `esc`.
 */

const BRAND = "#1a5632";
const SITE_URL = (process.env.SITE_URL || "https://safeafrika.com").replace(/\/$/, "");
const esc = escapeHtml;

function layout(heading: string, bodyHtml: string) {
  return `<div style="margin:0;padding:24px;background:#f4f6f2;font-family:Segoe UI,Arial,sans-serif;color:#1c231d;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e6da;">
    <div style="background:${BRAND};padding:20px 28px;">
      <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">SAFE Africa</span>
    </div>
    <div style="padding:28px;">
      <h1 style="margin:0 0 16px;font-size:20px;line-height:1.3;color:#16301d;">${heading}</h1>
      ${bodyHtml}
    </div>
    <div style="padding:18px 28px;background:#f4f6f2;border-top:1px solid #e2e6da;color:#5c6357;font-size:12px;">
      Smart Agriculture and Food Economics Africa Ltd · Nairobi, Kenya<br/>
      <a href="${SITE_URL}" style="color:${BRAND};">safeafrika.com</a>
    </div>
  </div>
</div>`;
}

const p = (text: string) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${text}</p>`;

function button(label: string, href: string) {
  return `<p style="margin:20px 0;"><a href="${href}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;font-weight:600;">${esc(label)}</a></p>`;
}

const regards = p(`Warm regards,<br/><strong>The SAFE Africa Recruitment Team</strong>`);

export function applicationReceived(name: string, vacancyTitle: string) {
  return {
    subject: `We received your application — ${vacancyTitle}`,
    html: layout(
      "Application received",
      p(`Dear ${esc(name)},`) +
        p(`Thank you for applying for the <strong>${esc(vacancyTitle)}</strong> position at SAFE Africa. We have received your application and our team will review it carefully.`) +
        p(`We acknowledge all applications, but will contact only shortlisted candidates. We wish you the best of luck.`) +
        regards
    ),
  };
}

export function applicationShortlisted(name: string, vacancyTitle: string) {
  return {
    subject: `You've been shortlisted — ${vacancyTitle}`,
    html: layout(
      "Good news — you've been shortlisted",
      p(`Dear ${esc(name)},`) +
        p(`We are pleased to inform you that you have been <strong>shortlisted</strong> for the <strong>${esc(vacancyTitle)}</strong> position at SAFE Africa.`) +
        p(`Our team will be in touch shortly with the next steps. Please keep an eye on your inbox and phone.`) +
        regards
    ),
  };
}

export function applicationRejected(name: string, vacancyTitle: string) {
  return {
    subject: `Update on your application — ${vacancyTitle}`,
    html: layout(
      "Update on your application",
      p(`Dear ${esc(name)},`) +
        p(`Thank you for your interest in the <strong>${esc(vacancyTitle)}</strong> position at SAFE Africa and for the time you invested in your application.`) +
        p(`After careful consideration, we will not be moving forward with your application on this occasion. We encourage you to join our talent pool so we can reach out about future opportunities that match your profile.`) +
        button("Join our talent pool", `${SITE_URL}/careers/talent-pool`) +
        regards
    ),
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
  const details =
    `<table style="width:100%;border-collapse:collapse;margin:0 0 14px;font-size:15px;">` +
    `<tr><td style="padding:6px 0;color:#5c6357;width:120px;">Position</td><td style="padding:6px 0;"><strong>${esc(opts.position)}</strong></td></tr>` +
    `<tr><td style="padding:6px 0;color:#5c6357;">When</td><td style="padding:6px 0;"><strong>${esc(opts.whenText)}</strong></td></tr>` +
    `<tr><td style="padding:6px 0;color:#5c6357;">Format</td><td style="padding:6px 0;">${esc(opts.mode)}</td></tr>` +
    (opts.locationOrLink ? `<tr><td style="padding:6px 0;color:#5c6357;">Where</td><td style="padding:6px 0;">${esc(opts.locationOrLink)}</td></tr>` : "") +
    `</table>`;
  return {
    subject: `Interview invitation — ${opts.position}`,
    html: layout(
      "You're invited to an interview",
      p(`Dear ${esc(opts.name)},`) +
        p(`We would like to invite you to an interview for the <strong>${esc(opts.position)}</strong> role. The details are below:`) +
        details +
        (opts.notes ? p(esc(opts.notes)) : "") +
        p(`Please reply to this email to confirm your availability. If the proposed time does not work, let us know and we will do our best to accommodate you.`) +
        regards
    ),
  };
}

export function offerSent(name: string, position: string, offerNotes?: string | null) {
  return {
    subject: `Job offer — ${position}`,
    html: layout(
      "We'd like to offer you the role",
      p(`Dear ${esc(name)},`) +
        p(`Congratulations! Following your interview, we are delighted to offer you the <strong>${esc(position)}</strong> position at SAFE Africa.`) +
        (offerNotes ? p(esc(offerNotes)) : "") +
        p(`Please reply to this email to indicate whether you accept the offer. A member of our team will follow up with the formal paperwork and onboarding details.`) +
        regards
    ),
  };
}

export function talentPoolWelcome(name: string) {
  return {
    subject: "Welcome to the SAFE Africa talent pool",
    html: layout(
      "You're in our talent pool",
      p(`Dear ${esc(name)},`) +
        p(`Thank you for joining the SAFE Africa talent pool. Your profile is now on file, and we'll notify you by email whenever a new opening matches your expertise.`) +
        p(`You can update your details at any time by submitting the talent pool form again with the same email address.`) +
        button("View current openings", `${SITE_URL}/careers`) +
        regards
    ),
  };
}

export function newOpeningNotice(name: string, vacancyTitle: string, slug: string) {
  return {
    subject: `New opening at SAFE Africa — ${vacancyTitle}`,
    html: layout(
      "A new opportunity may interest you",
      p(`Dear ${esc(name)},`) +
        p(`As a member of our talent pool, we wanted you to be among the first to know: SAFE Africa is now hiring for <strong>${esc(vacancyTitle)}</strong>.`) +
        button("View the opening & apply", `${SITE_URL}/careers/${esc(slug)}`) +
        p(`If this role isn't the right fit, keep an eye out — we'll continue to let you know about opportunities that match your profile.`) +
        regards
    ),
  };
}
