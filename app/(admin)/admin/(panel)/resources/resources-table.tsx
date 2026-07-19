"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteResource } from "@/lib/actions/resources";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Resource } from "@/lib/generated/prisma/client";

type Row = Resource & { thematicArea: { title: string } | null };

const columns: Column<Row>[] = [
  { key: "title", header: "Title", value: (r) => r.title, cell: (r) => <span className="block max-w-72 truncate font-medium">{r.title}</span> },
  {
    key: "type",
    header: "Type",
    value: (r) => r.type,
    cell: (r) => <Badge variant="secondary">{r.type.replace("_", " ").toLowerCase()}</Badge>,
  },
  {
    key: "area",
    header: "Thematic area",
    value: (r) => r.thematicArea?.title ?? "",
    cell: (r) => <span className="block max-w-44 truncate text-muted-foreground">{r.thematicArea?.title ?? "—"}</span>,
    hideOnMobile: true,
  },
  {
    key: "published",
    header: "Published",
    value: (r) => r.publishedAt,
    cell: (r) => <span className="whitespace-nowrap font-mono text-xs">{formatDate(r.publishedAt)}</span>,
  },
];

export function ResourcesTable({ resources }: { resources: Row[] }) {
  return (
    <DataTable
      rows={resources}
      columns={columns}
      rowKey={(r) => r.id}
      rowHref={(r) => `/admin/resources/${r.id}`}
      defaultSort={{ key: "published", dir: "desc" }}
      searchPlaceholder="Search title, type…"
      emptyMessage="No resources yet. Upload the first publication."
      actions={(r) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/resources/${r.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteResource.bind(null, r.id)}
            restore={restoreItem.bind(null, "resource", r.id)}
            resourceLabel={`resource “${r.title}”`}
          />
        </>
      )}
    />
  );
}
