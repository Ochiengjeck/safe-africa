"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { teamMemberSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic } from "@/lib/actions/shared";

export async function saveTeamMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(teamMemberSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.teamMember.update({ where: { id }, data });
  } else {
    await prisma.teamMember.create({ data });
  }
  revalidatePublic();
  return { ok: true };
}

export async function deleteTeamMember(id: string) {
  await requireRole("ADMIN");
  await prisma.teamMember.delete({ where: { id } });
  revalidatePublic();
}
