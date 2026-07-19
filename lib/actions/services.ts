"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { serviceSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";

export async function saveService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(serviceSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  const current = id ? await prisma.service.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.service.findUnique({ where: { slug: s } })),
    current?.slug
  );

  if (id) {
    await prisma.service.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.service.create({ data: { ...data, slug } });
  }
  revalidatePublic();
  redirect("/admin/services?saved=Service+saved");
}

export async function deleteService(id: string) {
  await requireRole("ADMIN");
  await prisma.service.delete({ where: { id } });
  revalidatePublic();
}
