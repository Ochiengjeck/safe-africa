import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AreaForm } from "../area-form";

export const metadata = { title: "Edit Thematic Area — SAFE Africa CMS" };

export default async function EditThematicAreaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const area = await prisma.thematicArea.findUnique({ where: { id } });
  if (!area) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit thematic area</h1>
      <AreaForm area={area} />
    </div>
  );
}
