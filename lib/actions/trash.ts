"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { revalidatePublic } from "@/lib/actions/shared";

/**
 * Soft-delete lifecycle shared by all trashable content models.
 * Delete actions in each module set deletedAt; these actions restore or
 * permanently remove items from the unified /admin/trash view.
 */

export type TrashKind =
  | "project"
  | "resource"
  | "vacancy"
  | "post"
  | "galleryImage"
  | "teamMember"
  | "contactMessage";

function delegateFor(kind: TrashKind) {
  switch (kind) {
    case "project":
      return prisma.project;
    case "resource":
      return prisma.resource;
    case "vacancy":
      return prisma.vacancy;
    case "post":
      return prisma.post;
    case "galleryImage":
      return prisma.galleryImage;
    case "teamMember":
      return prisma.teamMember;
    case "contactMessage":
      return prisma.contactMessage;
  }
}

export async function restoreItem(kind: TrashKind, id: string) {
  await requireRole(kind === "contactMessage" ? "ADMIN" : "EDITOR");
  // Delegates share the deletedAt shape; the union confuses the type system.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (delegateFor(kind) as any).update({ where: { id }, data: { deletedAt: null } });
  revalidatePublic();
}

export async function permanentlyDeleteItem(kind: TrashKind, id: string) {
  await requireRole("SUPER_ADMIN");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (delegateFor(kind) as any).delete({ where: { id } });
  revalidatePublic();
}
