import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { VacancyForm } from "../vacancy-form";

export const metadata = { title: "Edit Vacancy — SAFE Africa CMS" };

export default async function EditVacancyPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const vacancy = await prisma.vacancy.findUnique({ where: { id } });
  if (!vacancy) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit vacancy</h1>
      <VacancyForm vacancy={vacancy} />
    </div>
  );
}
