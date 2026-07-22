"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setTalentStatus, deleteTalentEntry } from "@/lib/actions/talent-pool";
import { restoreItem } from "@/lib/actions/trash";
import type { TalentStatus } from "@/lib/generated/prisma/client";

export type TalentRow = {
  id: string;
  fullName: string;
  professionalTitle: string;
  specializations: string;
  location: string;
  status: TalentStatus;
};

const STATUS_VARIANT: Record<TalentStatus, "default" | "secondary" | "outline"> = {
  ACTIVE: "default",
  INVITED: "secondary",
  ARCHIVED: "outline",
};

const columns: Column<TalentRow>[] = [
  { key: "fullName", header: "Name", value: (r) => r.fullName, cell: (r) => <span className="font-medium">{r.fullName}</span> },
  { key: "professionalTitle", header: "Title", value: (r) => r.professionalTitle },
  { key: "specializations", header: "Specializations", value: (r) => r.specializations, hideOnMobile: true, cell: (r) => <span className="text-xs text-muted-foreground">{r.specializations}</span> },
  { key: "location", header: "Location", value: (r) => r.location, hideOnMobile: true },
  { key: "status", header: "Status", value: (r) => r.status, cell: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge> },
];

export function TalentPoolTable({ rows }: { rows: TalentRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      rowHref={(r) => `/admin/careers/talent-pool/${r.id}`}
      defaultSort={{ key: "fullName", dir: "asc" }}
      searchPlaceholder="Search name, title, specialization…"
      emptyMessage="No talent pool members yet."
      actions={(r) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/careers/interviews/new?talentPoolId=${r.id}`}>Invite</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/careers/talent-pool/${r.id}`}>View</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              startTransition(async () => {
                await setTalentStatus(r.id, r.status === "ARCHIVED" ? "ACTIVE" : "ARCHIVED");
                router.refresh();
                toast.success(r.status === "ARCHIVED" ? "Reactivated" : "Archived");
              })
            }
          >
            {r.status === "ARCHIVED" ? "Reactivate" : "Archive"}
          </Button>
          <DeleteButton
            action={deleteTalentEntry.bind(null, r.id)}
            restore={restoreItem.bind(null, "talentPoolEntry", r.id)}
            resourceLabel={`talent pool profile for “${r.fullName}”`}
          />
        </>
      )}
    />
  );
}
