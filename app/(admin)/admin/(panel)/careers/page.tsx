import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { VacanciesTable } from "./vacancies-table";

export const metadata = { title: "Careers — SAFE Africa CMS" };

export default async function AdminCareersPage() {
  const vacancies = await prisma.vacancy.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Careers</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/careers/applications">Applications inbox</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/careers/new">New vacancy</Link>
          </Button>
        </div>
      </div>
      <Suspense>
        <VacanciesTable vacancies={vacancies} />
      </Suspense>
    </div>
  );
}
