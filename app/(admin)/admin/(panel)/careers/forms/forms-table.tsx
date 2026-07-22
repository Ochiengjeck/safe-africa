"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteApplicationForm, duplicateApplicationForm } from "@/lib/actions/application-forms";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  name: string;
  isTemplate: boolean;
  resumeStrict: boolean;
  fieldCount: number;
  vacancyCount: number;
};

const columns: Column<Row>[] = [
  { key: "name", header: "Name", value: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    key: "isTemplate",
    header: "Kind",
    value: (r) => (r.isTemplate ? "Template" : "Form"),
    cell: (r) => <Badge variant={r.isTemplate ? "default" : "outline"}>{r.isTemplate ? "Template" : "Form"}</Badge>,
  },
  { key: "fieldCount", header: "Fields", value: (r) => r.fieldCount, numeric: true },
  { key: "vacancyCount", header: "In use by", value: (r) => r.vacancyCount, numeric: true, cell: (r) => `${r.vacancyCount} vacancy(ies)` },
];

export function FormsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      rowHref={(r) => `/admin/careers/forms/${r.id}`}
      defaultSort={{ key: "isTemplate", dir: "desc" }}
      searchPlaceholder="Search forms…"
      emptyMessage="No application forms yet. Create one to reuse across vacancies."
      actions={(r) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/careers/forms/${r.id}`}>Edit</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                await duplicateApplicationForm(r.id);
                router.refresh();
                toast.success("Form duplicated");
              })
            }
          >
            Duplicate
          </Button>
          <DeleteButton
            action={deleteApplicationForm.bind(null, r.id)}
            restore={restoreItem.bind(null, "applicationForm", r.id)}
            resourceLabel={`form “${r.name}”`}
            description={
              r.vacancyCount > 0
                ? `This form is used by ${r.vacancyCount} vacancy(ies); they will fall back to the default form. It moves to Trash and can be restored.`
                : "It moves to Trash and can be restored."
            }
          />
        </>
      )}
    />
  );
}
