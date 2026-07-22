"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { applicationFormSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic } from "@/lib/actions/shared";

export async function saveApplicationForm(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseForm(applicationFormSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, fields, ...data } = parsed.data;

  const values = {
    ...data,
    fields: fields as object,
    resumeTemplateUrl: data.resumeTemplateUrl ?? null,
  };

  if (id) await prisma.applicationForm.update({ where: { id }, data: values });
  else await prisma.applicationForm.create({ data: values });

  revalidatePublic();
  redirect("/admin/careers/forms?saved=Application+form+saved");
}

export async function deleteApplicationForm(id: string) {
  await requireRole("ADMIN");
  await prisma.applicationForm.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/careers/forms");
  revalidatePublic();
}

/** Duplicate a form (e.g. to spin a new variant off a template). */
export async function duplicateApplicationForm(id: string) {
  await requireRole("ADMIN");
  const form = await prisma.applicationForm.findUnique({ where: { id } });
  if (!form) return;
  await prisma.applicationForm.create({
    data: {
      name: `${form.name} (copy)`,
      description: form.description,
      fields: form.fields as object,
      isTemplate: false,
      requireCv: form.requireCv,
      resumeStrict: form.resumeStrict,
      resumeTemplateUrl: form.resumeTemplateUrl,
    },
  });
  revalidatePath("/admin/careers/forms");
}
