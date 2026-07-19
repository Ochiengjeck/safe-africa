"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteThematicArea } from "@/lib/actions/thematic-areas";
import { Button } from "@/components/ui/button";
import type { ThematicArea } from "@/lib/generated/prisma/client";

const columns: Column<ThematicArea>[] = [
  { key: "order", header: "Order", value: (a) => a.order, numeric: true },
  { key: "title", header: "Title", value: (a) => a.title, cell: (a) => <span className="block max-w-64 truncate font-medium">{a.title}</span> },
  {
    key: "tagline",
    header: "Tagline",
    value: (a) => a.tagline,
    cell: (a) => <span className="block max-w-80 truncate text-muted-foreground">{a.tagline}</span>,
    hideOnMobile: true,
  },
];

export function AreasTable({ areas }: { areas: ThematicArea[] }) {
  return (
    <DataTable
      rows={areas}
      columns={columns}
      rowKey={(a) => a.id}
      rowHref={(a) => `/admin/thematic-areas/${a.id}`}
      defaultSort={{ key: "order", dir: "asc" }}
      searchPlaceholder="Search areas…"
      emptyMessage="No thematic areas yet."
      actions={(a) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/thematic-areas/${a.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteThematicArea.bind(null, a.id)}
            resourceLabel={`thematic area “${a.title}”`}
            description="Projects and resources linked to it keep existing but lose this tag. This cannot be undone."
          />
        </>
      )}
    />
  );
}
