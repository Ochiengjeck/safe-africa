"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { projectSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic, uniqueSlug } from "@/lib/actions/shared";

export async function saveProject(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(projectSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, thematicAreaIds, ...data } = parsed.data;

  const current = id ? await prisma.project.findUnique({ where: { id } }) : null;
  const slug = await uniqueSlug(
    data.title,
    async (s) => Boolean(await prisma.project.findUnique({ where: { slug: s } })),
    current?.slug
  );
  const areas = { set: [] as { id: string }[], connect: thematicAreaIds.map((areaId) => ({ id: areaId })) };

  if (id) {
    await prisma.project.update({ where: { id }, data: { ...data, slug, thematicAreas: areas } });
  } else {
    await prisma.project.create({
      data: { ...data, slug, thematicAreas: { connect: areas.connect } },
    });
  }
  revalidatePublic();
  redirect("/admin/projects?saved=Project+saved");
}

export async function deleteProject(id: string) {
  await requireRole("ADMIN");
  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePublic();
}

export async function addProjectImage(projectId: string, url: string, publicId?: string) {
  await requireRole("EDITOR");
  await prisma.projectImage.create({ data: { projectId, url, publicId } });
  revalidatePublic();
}

export async function deleteProjectImage(id: string) {
  await requireRole("EDITOR");
  await prisma.projectImage.delete({ where: { id } });
  revalidatePublic();
}

export async function addProjectAttachment(projectId: string, url: string, name: string, publicId?: string) {
  await requireRole("EDITOR");
  await prisma.projectAttachment.create({ data: { projectId, url, name, publicId } });
  revalidatePublic();
}

export async function deleteProjectAttachment(id: string) {
  await requireRole("EDITOR");
  await prisma.projectAttachment.delete({ where: { id } });
  revalidatePublic();
}
