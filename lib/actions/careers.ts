"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { vacancySchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";

export async function saveVacancy(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseForm(vacancySchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  const current = id ? await prisma.vacancy.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.vacancy.findUnique({ where: { slug: s } })),
    current?.slug
  );

  if (id) {
    await prisma.vacancy.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.vacancy.create({ data: { ...data, slug } });
  }
  revalidatePublic();
  redirect("/admin/careers");
}

export async function deleteVacancy(id: string) {
  await requireRole("ADMIN");
  await prisma.vacancy.delete({ where: { id } });
  revalidatePublic();
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  await requireRole("ADMIN");
  await prisma.application.update({ where: { id }, data: { status } });
}
