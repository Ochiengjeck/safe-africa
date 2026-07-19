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
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/messages");
}

export async function restoreMessage(id: string) {
  await requireRole("ADMIN");
  await prisma.contactMessage.update({ where: { id }, data: { deletedAt: null } });
  revalidatePath("/admin/messages");
}

// ——— Bulk actions (messages inbox) ———

export async function setManyMessagesRead(ids: string[], read: boolean) {
  await requireRole("ADMIN");
  await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { read } });
  revalidatePath("/admin/messages");
}

export async function deleteManyMessages(ids: string[]) {
  await requireRole("ADMIN");
  await prisma.contactMessage.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/messages");
}
