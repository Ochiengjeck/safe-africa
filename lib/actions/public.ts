"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema, applicationSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { rateLimited } from "@/lib/rate-limit";
import { sendNotification, escapeHtml } from "@/lib/email";

export async function submitContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(contactSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { website, ...data } = parsed.data;
  if (website) return { ok: true }; // honeypot tripped — pretend success
  if (await rateLimited("contact")) {
    return { error: "Too many submissions. Please try again in a minute." };
  }

  await prisma.contactMessage.create({ data });
  await sendNotification(
    `New contact message from ${data.name}`,
    `<p><strong>From:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)})</p>
     <p><strong>Subject:</strong> ${escapeHtml(data.subject ?? "—")}</p>
     <p>${escapeHtml(data.message)}</p>`
  );
  return { ok: true };
}

export async function submitApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = parseForm(applicationSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { website, ...data } = parsed.data;
  if (website) return { ok: true }; // honeypot tripped — pretend success
  if (await rateLimited("apply", 3)) {
    return { error: "Too many submissions. Please try again in a minute." };
  }

  const vacancy = await prisma.vacancy.findUnique({ where: { id: data.vacancyId } });
  if (!vacancy || vacancy.status !== "OPEN") {
    return { error: "This vacancy is no longer open for applications." };
  }

  await prisma.application.create({ data });
  await sendNotification(
    `New application: ${vacancy.title}`,
    `<p><strong>Vacancy:</strong> ${escapeHtml(vacancy.title)}</p>
     <p><strong>Applicant:</strong> ${escapeHtml(data.name)} (${escapeHtml(data.email)}, ${escapeHtml(data.phone)})</p>
     <p>${escapeHtml(data.coverLetter)}</p>
     ${data.cvUrl ? `<p><a href="${escapeHtml(data.cvUrl)}">Download CV</a></p>` : "<p>No CV attached.</p>"}`
  );
  return { ok: true };
}
