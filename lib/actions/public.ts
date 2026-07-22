"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema, talentPoolSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { rateLimited } from "@/lib/rate-limit";
import { sendNotification, sendMail, escapeHtml } from "@/lib/email";
import { applicationReceived, talentPoolWelcome } from "@/lib/email/templates";
import {
  defaultApplicationFields,
  validateAnswers,
  extractContact,
  isInputField,
  FIELD_PREFIX,
  type FormField,
  type Answers,
} from "@/lib/careers/form-fields";

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

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002");
}

/** Reads a dynamic form's answers out of the submitted FormData. */
function readAnswers(fields: FormField[], formData: FormData): Answers {
  const answers: Answers = {};
  for (const field of fields) {
    if (!isInputField(field)) continue;
    const name = `${FIELD_PREFIX}${field.id}`;
    if (field.type === "multiselect") {
      answers[field.id] = formData.getAll(`${name}[]`).map(String).filter(Boolean);
    } else if (field.type === "consent") {
      const v = formData.get(name);
      answers[field.id] = v === "on" || v === "true";
    } else {
      const v = formData.get(name);
      answers[field.id] = v == null ? "" : String(v).trim();
    }
  }
  return answers;
}

export async function submitApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const website = String(formData.get("website") || "");
  if (website) return { ok: true }; // honeypot tripped
  const vacancyId = String(formData.get("vacancyId") || "");
  if (!vacancyId) return { error: "Missing vacancy reference." };
  if (await rateLimited("apply", 3)) {
    return { error: "Too many submissions. Please try again in a minute." };
  }

  const vacancy = await prisma.vacancy.findUnique({ where: { id: vacancyId }, include: { form: true } });
  if (!vacancy || vacancy.status !== "OPEN" || vacancy.deletedAt) {
    return { error: "This vacancy is no longer open for applications." };
  }

  const fields = (vacancy.form?.fields as FormField[] | undefined) ?? defaultApplicationFields();
  const requireCv = vacancy.form?.requireCv ?? true;
  const answers = readAnswers(fields, formData);
  const cvUrl = String(formData.get("cvUrl") || "").trim() || undefined;

  const fieldErrors: Record<string, string[]> = {};
  const result = validateAnswers(fields, answers);
  if (!result.ok) Object.assign(fieldErrors, result.fieldErrors);
  if (requireCv && !cvUrl) fieldErrors.cvUrl = ["Please attach your CV in the required format."];
  if (Object.keys(fieldErrors).length) {
    return { error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { name, email, phone } = extractContact(fields, answers);
  if (!email) return { error: "This form is missing an email field. Please contact us." };

  const coverField = fields.find((f) => f.id === "cover_letter" || f.type === "long_text");
  const coverLetter = coverField && typeof answers[coverField.id] === "string" ? (answers[coverField.id] as string) : null;

  try {
    await prisma.application.create({
      data: {
        vacancyId,
        name: name || email,
        email,
        phone: phone || "",
        coverLetter,
        answers: answers as object,
        cvUrl,
        notifiedStatuses: ["NEW"],
      },
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return { error: "You have already applied to this vacancy with this email address." };
    }
    throw error;
  }

  const confirmation = applicationReceived(name || email, vacancy.title);
  await sendMail(email, confirmation.subject, confirmation.html);
  await sendNotification(
    `New application: ${vacancy.title}`,
    `<p><strong>Vacancy:</strong> ${escapeHtml(vacancy.title)}</p>
     <p><strong>Applicant:</strong> ${escapeHtml(name || email)} (${escapeHtml(email)}, ${escapeHtml(phone)})</p>
     ${cvUrl ? `<p><a href="${escapeHtml(cvUrl)}">Download CV</a></p>` : "<p>No CV attached.</p>"}`
  );
  return { ok: true };
}

// ——— Talent pool signup (structured CV; JSON payload) ———

type TalentPoolResult = { ok: true } | { ok: false; error: string; issues?: string[] };

export async function submitTalentPool(payload: unknown): Promise<TalentPoolResult> {
  const parsed = talentPoolSchema.safeParse(payload);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".") || "form"}: ${i.message}`);
    return { ok: false, error: "Please review the highlighted sections and try again.", issues };
  }
  const { website, ...data } = parsed.data;
  if (website) return { ok: true }; // honeypot tripped
  if (await rateLimited("talent-pool", 3)) {
    return { ok: false, error: "Too many submissions. Please try again in a minute." };
  }

  const denorm = {
    fullName: data.fullName,
    email: data.primaryEmail.toLowerCase(),
    phone: data.primaryPhone,
    professionalTitle: data.professionalTitle,
    specializations: data.primarySpecializations,
    location: data.location,
    nationality: data.nationality,
    retention: data.dataRetentionPeriod,
    consent: true,
  };

  await prisma.talentPoolEntry.upsert({
    where: { email: denorm.email },
    update: { ...denorm, data: data as object, status: "ACTIVE", deletedAt: null },
    create: { ...denorm, data: data as object },
  });

  const welcome = talentPoolWelcome(data.fullName);
  await sendMail(denorm.email, welcome.subject, welcome.html);
  await sendNotification(
    `New talent pool signup: ${data.fullName}`,
    `<p><strong>${escapeHtml(data.fullName)}</strong> — ${escapeHtml(data.professionalTitle)}</p>
     <p>${escapeHtml(denorm.email)} · ${escapeHtml(data.primaryPhone)}</p>
     <p><strong>Specializations:</strong> ${escapeHtml(data.primarySpecializations.join(", "))}</p>`
  );
  return { ok: true };
}
