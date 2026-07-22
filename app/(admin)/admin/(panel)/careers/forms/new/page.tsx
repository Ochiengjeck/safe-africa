import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { FormEditor } from "../form-editor";
import type { FormField } from "@/lib/careers/form-fields";

export const metadata = { title: "New Application Form — SAFE Africa CMS" };

export default async function NewApplicationFormPage(props: {
  searchParams: Promise<{ template?: string; blank?: string }>;
}) {
  const { template, blank } = await props.searchParams;

  if (blank) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">New application form</h1>
        <FormEditor />
      </div>
    );
  }

  if (template) {
    const source = await prisma.applicationForm.findFirst({ where: { id: template, deletedAt: null } });
    if (source) {
      return (
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-bold">New form from “{source.name}”</h1>
          <FormEditor initialFields={source.fields as FormField[]} />
        </div>
      );
    }
  }

  const templates = await prisma.applicationForm.findMany({
    where: { deletedAt: null, isTemplate: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, fields: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">New application form</h1>
        <p className="text-sm text-muted-foreground">Start from a template or build one from scratch.</p>
      </div>

      <div className="space-y-3">
        {templates.map((tpl) => (
          <Link
            key={tpl.id}
            href={`/admin/careers/forms/new?template=${tpl.id}`}
            className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
          >
            <div>
              <p className="font-medium">{tpl.name}</p>
              {tpl.description && <p className="text-sm text-muted-foreground">{tpl.description}</p>}
              <p className="mt-1 text-xs text-muted-foreground">
                {Array.isArray(tpl.fields) ? tpl.fields.length : 0} fields
              </p>
            </div>
            <span className="text-sm font-medium text-primary">Use template →</span>
          </Link>
        ))}
      </div>

      <div className="border-t pt-4">
        <Button asChild variant="outline">
          <Link href="/admin/careers/forms/new?blank=1">Start from a blank form</Link>
        </Button>
      </div>
    </div>
  );
}
