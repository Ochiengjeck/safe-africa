"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateApplicationStatus,
  bulkUpdateApplicationStatus,
  deleteApplication,
  deleteManyApplications,
} from "@/lib/actions/careers";
import { restoreItem } from "@/lib/actions/trash";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";
import type { FormField } from "@/lib/careers/form-fields";

export type AppRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: ApplicationStatus;
  received: string;
  cvUrl: string | null;
  coverLetter: string | null;
  answers: Record<string, unknown> | null;
};

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "outline"> = {
  NEW: "default",
  REVIEWED: "secondary",
  SHORTLISTED: "default",
  REJECTED: "outline",
};

const NEXT_STATUSES: ApplicationStatus[] = ["REVIEWED", "SHORTLISTED", "REJECTED"];

function answerText(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function ApplicationsGroup({
  vacancyTitle,
  rows,
  fields,
}: {
  vacancyTitle: string;
  rows: AppRow[];
  fields: FormField[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [detail, setDetail] = useState<AppRow | null>(null);

  const columns: Column<AppRow>[] = [
    { key: "name", header: "Applicant", value: (r) => r.name, cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "email", header: "Email", value: (r) => r.email, hideOnMobile: true },
    { key: "received", header: "Received", value: (r) => r.received, cell: (r) => <span className="whitespace-nowrap font-mono text-xs">{r.received}</span> },
    {
      key: "status",
      header: "Status",
      value: (r) => r.status,
      cell: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge>,
    },
  ];

  function quickSet(id: string, status: ApplicationStatus) {
    startTransition(async () => {
      await updateApplicationStatus(id, status);
      router.refresh();
      toast.success(`Marked ${status.toLowerCase()}`);
    });
  }

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
        defaultSort={{ key: "received", dir: "desc" }}
        searchPlaceholder="Search applicants…"
        emptyMessage="No applications."
        bulkActions={(ids, clear) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                startTransition(async () => {
                  await bulkUpdateApplicationStatus(ids, "SHORTLISTED");
                  clear();
                  router.refresh();
                  toast.success(`${ids.length} shortlisted`);
                })
              }
            >
              Shortlist
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                startTransition(async () => {
                  await bulkUpdateApplicationStatus(ids, "REVIEWED");
                  clear();
                  router.refresh();
                  toast.success(`${ids.length} marked reviewed`);
                })
              }
            >
              Mark reviewed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                startTransition(async () => {
                  await bulkUpdateApplicationStatus(ids, "REJECTED");
                  clear();
                  router.refresh();
                  toast.success(`${ids.length} rejected`);
                })
              }
            >
              Reject
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() =>
                startTransition(async () => {
                  await deleteManyApplications(ids);
                  clear();
                  router.refresh();
                  toast.success(`${ids.length} deleted`);
                })
              }
            >
              Delete
            </Button>
          </>
        )}
        actions={(r) => (
          <>
            <Button variant="outline" size="sm" onClick={() => setDetail(r)}>
              View
            </Button>
            <DeleteButton
              action={deleteApplication.bind(null, r.id)}
              restore={restoreItem.bind(null, "application", r.id)}
              resourceLabel={`application from “${r.name}”`}
            />
          </>
        )}
      />

      {detail && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetail(null)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="app-detail-title" className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="app-detail-title" className="font-display text-xl font-semibold">{detail.name}</h3>
                <p className="text-sm text-muted-foreground">{detail.email} · {detail.phone}</p>
                <p className="mt-1"><Badge variant={STATUS_VARIANT[detail.status]}>{detail.status.toLowerCase()}</Badge></p>
              </div>
              {detail.cvUrl && (
                <Button asChild variant="outline" size="sm">
                  <a href={detail.cvUrl} target="_blank" rel="noreferrer">Download CV</a>
                </Button>
              )}
            </div>

            <dl className="mt-5 space-y-3 border-t pt-4">
              {fields
                .filter((f) => f.type !== "section" && detail.answers && f.id in detail.answers)
                .map((f) => (
                  <div key={f.id}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                    <dd className="mt-0.5 whitespace-pre-wrap text-sm">{answerText(detail.answers?.[f.id])}</dd>
                  </div>
                ))}
              {(!detail.answers || Object.keys(detail.answers).length === 0) && detail.coverLetter && (
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover letter</dt>
                  <dd className="mt-0.5 whitespace-pre-wrap text-sm">{detail.coverLetter}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {NEXT_STATUSES.filter((s) => s !== detail.status).map((s) => (
                  <Button key={s} variant="outline" size="sm" onClick={() => { quickSet(detail.id, s); setDetail(null); }}>
                    Mark {s.toLowerCase()}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
