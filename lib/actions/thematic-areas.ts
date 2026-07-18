"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { thematicAreaSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";

export async function saveThematicArea(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(thematicAreaSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  const current = id ? await prisma.thematicArea.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.thematicArea.findUnique({ where: { slug: s } })),
    current?.slug
  );

  if (id) {
    await prisma.thematicArea.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.thematicArea.create({ data: { ...data, slug } });
  }
  revalidatePublic();
  redirect("/admin/thematic-areas");
}

export async function deleteThematicArea(id: string) {
  await requireRole("ADMIN");
  await prisma.thematicArea.delete({ where: { id } });
  revalidatePublic();
}
