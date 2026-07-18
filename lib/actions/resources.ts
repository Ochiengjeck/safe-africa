"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { resourceSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic } from "@/lib/actions/shared";

export async function saveResource(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(resourceSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, thematicAreaId, ...data } = parsed.data;
  const payload = { ...data, thematicAreaId: thematicAreaId || null };

  if (id) {
    await prisma.resource.update({ where: { id }, data: payload });
  } else {
    await prisma.resource.create({ data: payload });
  }
  revalidatePublic();
  redirect("/admin/resources");
}

export async function deleteResource(id: string) {
  await requireRole("ADMIN");
  await prisma.resource.delete({ where: { id } });
  revalidatePublic();
}
