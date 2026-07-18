import { prisma } from "@/lib/prisma";
import { ResourceForm } from "../resource-form";

export const metadata = { title: "New Resource — SAFE Africa CMS" };

export default async function NewResourcePage() {
  const thematicAreas = await prisma.thematicArea.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New resource</h1>
      <ResourceForm thematicAreas={thematicAreas} />
    </div>
  );
}
