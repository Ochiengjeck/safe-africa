import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { VacanciesTable } from "./vacancies-table";

export const metadata = { title: "Vacancies — SAFE Africa CMS" };

export default async function AdminVacanciesPage() {
  const vacancies = await prisma.vacancy.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: { where: { deletedAt: null } } } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Vacancies</h1>
        <Button asChild>
          <Link href="/admin/careers/vacancies/new">New vacancy</Link>
        </Button>
      </div>
      <Suspense>
        <VacanciesTable vacancies={vacancies} />
      </Suspense>
    </div>
  );
}
