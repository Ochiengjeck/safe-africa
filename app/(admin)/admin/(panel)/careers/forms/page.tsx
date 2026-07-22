import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FormsTable } from "./forms-table";

export const metadata = { title: "Application Forms — SAFE Africa CMS" };

export default async function ApplicationFormsPage() {
  const forms = await prisma.applicationForm.findMany({
    where: { deletedAt: null },
    orderBy: [{ isTemplate: "desc" }, { createdAt: "desc" }],
    include: { _count: { select: { vacancies: true } } },
  });

  const rows = forms.map((form) => ({
    id: form.id,
    name: form.name,
    isTemplate: form.isTemplate,
    resumeStrict: form.resumeStrict,
    fieldCount: Array.isArray(form.fields) ? form.fields.length : 0,
    vacancyCount: form._count.vacancies,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Application forms</h1>
          <p className="text-sm text-muted-foreground">Reusable forms and templates that power vacancy applications.</p>
        </div>
        <Button asChild>
          <Link href="/admin/careers/forms/new">New form</Link>
        </Button>
      </div>
      <Suspense>
        <FormsTable rows={rows} />
      </Suspense>
    </div>
  );
}
