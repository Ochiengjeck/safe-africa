import { prisma } from "@/lib/prisma";
import { ProjectForm } from "../project-form";

export const metadata = { title: "New Project — SAFE Africa CMS" };

export default async function NewProjectPage() {
  const thematicAreas = await prisma.thematicArea.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New project</h1>
      <ProjectForm thematicAreas={thematicAreas} />
    </div>
  );
}
