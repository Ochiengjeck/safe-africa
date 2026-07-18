import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResourceForm } from "../resource-form";

export const metadata = { title: "Edit Resource — SAFE Africa CMS" };

export default async function EditResourcePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [resource, thematicAreas] = await Promise.all([
    prisma.resource.findUnique({ where: { id } }),
    prisma.thematicArea.findMany({ orderBy: { order: "asc" }, select: { id: true, title: true } }),
  ]);
  if (!resource) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit resource</h1>
      <ResourceForm resource={resource} thematicAreas={thematicAreas} />
    </div>
  );
}
