import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordMeta } from "@/components/admin/record-meta";
import { ProjectForm } from "../project-form";
import { ProjectMedia } from "./project-media";

export const metadata = { title: "Edit Project — SAFE Africa CMS" };

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [project, thematicAreas] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: { thematicAreas: { select: { id: true } }, images: true, attachments: true },
    }),
    prisma.thematicArea.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Edit project</h1>
        <RecordMeta createdAt={project.createdAt} updatedAt={project.updatedAt} />
      </div>
      <ProjectForm project={project} thematicAreas={thematicAreas} />
      <ProjectMedia projectId={project.id} images={project.images} attachments={project.attachments} />
    </div>
  );
}
