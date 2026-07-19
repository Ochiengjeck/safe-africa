"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteService } from "@/lib/actions/services";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/generated/prisma/client";

const columns: Column<Service>[] = [
  { key: "order", header: "Order", value: (s) => s.order, numeric: true },
  { key: "title", header: "Title", value: (s) => s.title, cell: (s) => <span className="block max-w-64 truncate font-medium">{s.title}</span> },
  {
    key: "description",
    header: "Description",
    value: (s) => s.description,
    sortable: false,
    cell: (s) => <span className="block max-w-96 truncate text-muted-foreground">{s.description}</span>,
    hideOnMobile: true,
  },
];

export function ServicesTable({ services }: { services: Service[] }) {
  return (
    <DataTable
      rows={services}
      columns={columns}
      rowKey={(s) => s.id}
      rowHref={(s) => `/admin/services/${s.id}`}
      defaultSort={{ key: "order", dir: "asc" }}
      searchPlaceholder="Search services…"
      emptyMessage="No services yet."
      actions={(s) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/services/${s.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteService.bind(null, s.id)}
            resourceLabel={`service “${s.title}”`}
            description="This cannot be undone."
          />
        </>
      )}
    />
  );
}
