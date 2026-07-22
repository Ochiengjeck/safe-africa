import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
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
      <PageHeader
        eyebrow="Careers"
        title="Vacancies"
        subtitle="Draft, post, and close job openings; each links to its applications."
        actions={<Button asChild><Link href="/admin/careers/vacancies/new">New vacancy</Link></Button>}
      />
      <Suspense>
        <VacanciesTable vacancies={vacancies} />
      </Suspense>
    </div>
  );
}
