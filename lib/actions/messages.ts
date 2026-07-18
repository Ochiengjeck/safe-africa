"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { revalidatePath } from "next/cache";

export async function toggleMessageRead(id: string, read: boolean) {
  await requireRole("ADMIN");
  await prisma.contactMessage.update({ where: { id }, data: { read } });
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  await requireRole("ADMIN");
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}
