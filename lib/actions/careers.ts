"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { vacancySchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";
import { sendMail } from "@/lib/email";
import {
  applicationShortlisted,
  applicationRejected,
  newOpeningNotice,
} from "@/lib/email/templates";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";
import type { FormField as FormFieldType } from "@/lib/careers/form-fields";

// ——— Vacancies ———

export async function saveVacancy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseForm(vacancySchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, formId, ...data } = parsed.data;

  const current = id ? await prisma.vacancy.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.vacancy.findUnique({ where: { slug: s } })),
    current?.slug
  );

  // "Build a custom form for this vacancy" — create a one-off (non-template) form.
  let resolvedFormId: string | null = formId && formId !== "__custom__" ? formId : null;
  if (formId === "__custom__") {
    const rawFields = String(formData.get("customFields") || "");
    const name = String(formData.get("customFormName") || "").trim() || `${data.title} — application form`;
    try {
      const fields = JSON.parse(rawFields) as FormFieldType[];
      if (Array.isArray(fields) && fields.length > 0) {
        const created = await prisma.applicationForm.create({
          data: {
            name,
            fields: fields as object,
            isTemplate: false,
            requireCv: true,
            resumeStrict: data.resumeStrict ?? false,
            resumeTemplateUrl: data.resumeTemplateUrl ?? null,
          },
        });
        resolvedFormId = created.id;
      }
    } catch {
      return { error: "The custom form could not be read. Please rebuild it and try again." };
    }
  }

  const values = {
    ...data,
    slug,
    formId: resolvedFormId,
    resumeTemplateUrl: data.resumeTemplateUrl ?? null,
  };

  if (id) await prisma.vacancy.update({ where: { id }, data: values });
  else await prisma.vacancy.create({ data: values });

  revalidatePublic();
  redirect("/admin/careers/vacancies?saved=Vacancy+saved");
}

export async function deleteVacancy(id: string) {
  await requireRole("ADMIN");
  await prisma.vacancy.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePublic();
}

/** Post a vacancy (DRAFT/CLOSED → OPEN), optionally notifying the talent pool once. */
export async function postVacancy(id: string, notifyTalentPool = false) {
  await requireRole("ADMIN");
  const vacancy = await prisma.vacancy.update({ where: { id }, data: { status: "OPEN" } });

  if (notifyTalentPool && !vacancy.notifiedTalentPool) {
    const members = await prisma.talentPoolEntry.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      select: { fullName: true, email: true },
    });
    await Promise.allSettled(
      members.map((m) => {
        const { subject, html } = newOpeningNotice(m.fullName, vacancy.title, vacancy.slug);
        return sendMail(m.email, subject, html);
      })
    );
    await prisma.vacancy.update({ where: { id }, data: { notifiedTalentPool: true } });
  }

  revalidatePublic();
  revalidatePath("/admin/careers/vacancies");
}

export async function closeVacancy(id: string) {
  await requireRole("ADMIN");
  await prisma.vacancy.update({ where: { id }, data: { status: "CLOSED" } });
  revalidatePublic();
  revalidatePath("/admin/careers/vacancies");
}

// ——— Applications ———

function stageEmail(status: ApplicationStatus, name: string, vacancyTitle: string) {
  if (status === "SHORTLISTED") return applicationShortlisted(name, vacancyTitle);
  if (status === "REJECTED") return applicationRejected(name, vacancyTitle);
  return null;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  await requireRole("ADMIN");
  const app = await prisma.application.findUnique({
    where: { id },
    include: { vacancy: { select: { title: true } } },
  });
  if (!app) return;

  const email = stageEmail(status, app.name, app.vacancy.title);
  const shouldEmail = Boolean(email) && !app.notifiedStatuses.includes(status);

  await prisma.application.update({
    where: { id },
    data: { status, ...(shouldEmail ? { notifiedStatuses: { push: status } } : {}) },
  });

  if (shouldEmail && email) await sendMail(app.email, email.subject, email.html);
  revalidatePath("/admin/careers/applications");
}

export async function bulkUpdateApplicationStatus(ids: string[], status: ApplicationStatus) {
  await requireRole("ADMIN");
  if (ids.length === 0) return;

  const apps = await prisma.application.findMany({
    where: { id: { in: ids } },
    include: { vacancy: { select: { title: true } } },
  });

  await prisma.application.updateMany({ where: { id: { in: ids } }, data: { status } });

  if (status === "SHORTLISTED" || status === "REJECTED") {
    for (const app of apps) {
      if (app.notifiedStatuses.includes(status)) continue;
      const email = stageEmail(status, app.name, app.vacancy.title);
      if (!email) continue;
      await sendMail(app.email, email.subject, email.html);
      await prisma.application.update({
        where: { id: app.id },
        data: { notifiedStatuses: { push: status } },
      });
    }
  }
  revalidatePath("/admin/careers/applications");
}

export async function deleteApplication(id: string) {
  await requireRole("ADMIN");
  await prisma.application.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/careers/applications");
}

export async function deleteManyApplications(ids: string[]) {
  await requireRole("ADMIN");
  await prisma.application.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/careers/applications");
}
