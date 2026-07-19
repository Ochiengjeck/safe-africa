"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProject } from "@/lib/actions/projects";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeriod } from "@/lib/format";
import type { Project } from "@/lib/generated/prisma/client";

type Row = Project & { thematicAreas: { title: string }[] };

const columns: Column<Row>[] = [
  {
    key: "title",
    header: "Title",
    value: (p) => p.title,
    cell: (p) => (
      <span className="flex max-w-72 items-center gap-2">
        <span className="truncate font-medium">{p.title}</span>
        {p.featured && <Badge variant="secondary">featured</Badge>}
      </span>
    ),
  },
  { key: "client", header: "Client", value: (p) => p.client, cell: (p) => <span className="block max-w-44 truncate">{p.client}</span> },
  {
    key: "period",
    header: "Period",
    value: (p) => p.periodStart,
    cell: (p) => <span className="whitespace-nowrap font-mono text-xs">{formatPeriod(p.periodStart, p.periodEnd)}</span>,
  },
  {
    key: "status",
    header: "Status",
    value: (p) => p.status,
    cell: (p) => <Badge variant={p.status === "PUBLISHED" ? "default" : "outline"}>{p.status.toLowerCase()}</Badge>,
  },
  {
    key: "areas",
    header: "Areas",
    sortable: false,
    value: (p) => p.thematicAreas.map((a) => a.title).join(", "),
    cell: (p) => (
      <span className="block max-w-44 truncate text-muted-foreground">
        {p.thematicAreas.map((a) => a.title).join(", ") || "—"}
      </span>
    ),
    hideOnMobile: true,
  },
];

export function ProjectsTable({ projects }: { projects: Row[] }) {
  return (
    <DataTable
      rows={projects}
      columns={columns}
      rowKey={(p) => p.id}
      rowHref={(p) => `/admin/projects/${p.id}`}
      defaultSort={{ key: "period", dir: "desc" }}
      searchPlaceholder="Search title, client, area…"
      emptyMessage="No projects yet. Create the first one."
      actions={(p) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/projects/${p.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteProject.bind(null, p.id)}
            restore={restoreItem.bind(null, "project", p.id)}
            resourceLabel={`project “${p.title}”`}
          />
        </>
      )}
    />
  );
}
