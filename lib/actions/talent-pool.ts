"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import type { TalentStatus } from "@/lib/generated/prisma/client";

export async function setTalentStatus(id: string, status: TalentStatus) {
  await requireRole("ADMIN");
  await prisma.talentPoolEntry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/careers/talent-pool");
}

export async function deleteTalentEntry(id: string) {
  await requireRole("ADMIN");
  await prisma.talentPoolEntry.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/careers/talent-pool");
}
