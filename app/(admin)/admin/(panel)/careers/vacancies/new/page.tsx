import { prisma } from "@/lib/prisma";
import { VacancyForm } from "../vacancy-form";

export const metadata = { title: "New Vacancy — SAFE Africa CMS" };

export default async function NewVacancyPage() {
  const forms = await prisma.applicationForm.findMany({
    where: { deletedAt: null },
    orderBy: [{ isTemplate: "desc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">New vacancy</h1>
      <VacancyForm forms={forms} />
    </div>
  );
}
