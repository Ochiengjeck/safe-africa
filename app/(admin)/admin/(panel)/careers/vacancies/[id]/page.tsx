import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordMeta } from "@/components/admin/record-meta";
import { VacancyForm } from "../vacancy-form";

export const metadata = { title: "Edit Vacancy — SAFE Africa CMS" };

export default async function EditVacancyPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [vacancy, forms] = await Promise.all([
    prisma.vacancy.findUnique({ where: { id } }),
    prisma.applicationForm.findMany({
      where: { deletedAt: null },
      orderBy: [{ isTemplate: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
  if (!vacancy) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Edit vacancy</h1>
        <RecordMeta createdAt={vacancy.createdAt} updatedAt={vacancy.updatedAt} />
      </div>
      <VacancyForm vacancy={vacancy} forms={forms} />
    </div>
  );
}
