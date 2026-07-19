"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteVacancy } from "@/lib/actions/careers";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Vacancy } from "@/lib/generated/prisma/client";

type Row = Vacancy & { _count: { applications: number } };

const columns: Column<Row>[] = [
  { key: "title", header: "Title", value: (v) => v.title, cell: (v) => <span className="block max-w-72 truncate font-medium">{v.title}</span> },
  { key: "type", header: "Type", value: (v) => v.type, cell: (v) => (v.type === "JOB" ? "Job" : "Internship") },
  {
    key: "deadline",
    header: "Deadline",
    value: (v) => v.deadline,
    cell: (v) => <span className="whitespace-nowrap font-mono text-xs">{v.deadline ? formatDate(v.deadline) : "—"}</span>,
  },
  {
    key: "status",
    header: "Status",
    value: (v) => v.status,
    cell: (v) => <Badge variant={v.status === "OPEN" ? "default" : "outline"}>{v.status.toLowerCase()}</Badge>,
  },
  { key: "applications", header: "Applications", value: (v) => v._count.applications, numeric: true },
];

export function VacanciesTable({ vacancies }: { vacancies: Row[] }) {
  return (
    <DataTable
      rows={vacancies}
      columns={columns}
      rowKey={(v) => v.id}
      rowHref={(v) => `/admin/careers/${v.id}`}
      defaultSort={{ key: "deadline", dir: "desc" }}
      searchPlaceholder="Search title, location…"
      emptyMessage="No vacancies yet."
      actions={(v) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/careers/${v.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteVacancy.bind(null, v.id)}
            restore={restoreItem.bind(null, "vacancy", v.id)}
            resourceLabel={`vacancy “${v.title}”`}
            description={`Its ${v._count.applications} application(s) stay in the inbox. The vacancy moves to Trash and can be restored.`}
          />
        </>
      )}
    />
  );
}
