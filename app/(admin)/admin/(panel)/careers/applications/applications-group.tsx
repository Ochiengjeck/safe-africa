"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { bulkUpdateApplicationStatus, deleteApplication, deleteManyApplications } from "@/lib/actions/careers";
import { bulkCreateInterviews } from "@/lib/actions/interviews";
import { restoreItem } from "@/lib/actions/trash";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";

export type AppRow = {
  id: string;
  name: string;
  email: string;
  status: ApplicationStatus;
  received: string;
};

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "outline"> = {
  NEW: "default",
  REVIEWED: "secondary",
  SHORTLISTED: "default",
  REJECTED: "outline",
};

const columns: Column<AppRow>[] = [
  { key: "name", header: "Applicant", value: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: "email", header: "Email", value: (r) => r.email, hideOnMobile: true },
  { key: "received", header: "Received", value: (r) => r.received, cell: (r) => <span className="whitespace-nowrap font-mono text-xs">{r.received}</span> },
  { key: "status", header: "Status", value: (r) => r.status, cell: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge> },
];

export function ApplicationsGroup({ vacancyTitle, rows }: { vacancyTitle: string; rows: AppRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-lg font-semibold">{vacancyTitle}</h2>
        <Badge variant="outline">{rows.length}</Badge>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        rowHref={(r) => `/admin/careers/applications/${r.id}`}
        defaultSort={{ key: "received", dir: "desc" }}
        searchPlaceholder="Search applicants…"
        emptyMessage="No applications."
        bulkActions={(ids, clear) => (
          <>
            <Button variant="outline" size="sm" onClick={() => run(() => bulkUpdateApplicationStatus(ids, "SHORTLISTED"), clear, `${ids.length} shortlisted`)}>
              Shortlist
            </Button>
            <Button variant="outline" size="sm" onClick={() => run(() => bulkCreateInterviews(ids), clear, `${ids.length} interview draft(s) created — set times in Interviews`, "/admin/careers/interviews")}>
              Schedule interview
            </Button>
            <Button variant="outline" size="sm" onClick={() => run(() => bulkUpdateApplicationStatus(ids, "REVIEWED"), clear, `${ids.length} marked reviewed`)}>
              Mark reviewed
            </Button>
            <Button variant="outline" size="sm" onClick={() => run(() => bulkUpdateApplicationStatus(ids, "REJECTED"), clear, `${ids.length} rejected`)}>
              Reject
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => run(() => deleteManyApplications(ids), clear, `${ids.length} deleted`)}>
              Delete
            </Button>
          </>
        )}
        actions={(r) => (
          <>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/careers/applications/${r.id}`}>View</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/careers/interviews/new?applicationId=${r.id}`}>Interview</Link>
            </Button>
            <DeleteButton
              action={deleteApplication.bind(null, r.id)}
              restore={restoreItem.bind(null, "application", r.id)}
              resourceLabel={`application from “${r.name}”`}
            />
          </>
        )}
      />
    </section>
  );

  function run(fn: () => Promise<void>, clear: () => void, message: string, navigate?: string) {
    startTransition(async () => {
      await fn();
      clear();
      if (navigate) router.push(navigate);
      else router.refresh();
      toast.success(message);
    });
  }
}
