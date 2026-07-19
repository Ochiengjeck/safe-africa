"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { postSchema, galleryImageSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";

export async function savePost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(postSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  const current = id ? await prisma.post.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.post.findUnique({ where: { slug: s } })),
    current?.slug
  );

  if (id) {
    await prisma.post.update({ where: { id }, data: { ...data, slug } });
  } else {
    await prisma.post.create({ data: { ...data, slug } });
  }
  revalidatePublic();
  redirect("/admin/media?saved=Post+saved");
}

export async function deletePost(id: string) {
  await requireRole("ADMIN");
  await prisma.post.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePublic();
}

export async function saveGalleryImage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(galleryImageSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, ...data } = parsed.data;

  if (id) {
    await prisma.galleryImage.update({ where: { id }, data });
  } else {
    await prisma.galleryImage.create({ data });
  }
  revalidatePublic();
  return { ok: true };
}

export async function deleteGalleryImage(id: string) {
  await requireRole("EDITOR");
  await prisma.galleryImage.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePublic();
}
