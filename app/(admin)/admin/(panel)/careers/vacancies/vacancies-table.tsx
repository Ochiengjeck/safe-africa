"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteVacancy, postVacancy, closeVacancy } from "@/lib/actions/careers";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Vacancy } from "@/lib/generated/prisma/client";

type Row = Vacancy & { _count: { applications: number } };

const STATUS_VARIANT = { OPEN: "default", DRAFT: "secondary", CLOSED: "outline" } as const;

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
    cell: (v) => <Badge variant={STATUS_VARIANT[v.status]}>{v.status.toLowerCase()}</Badge>,
  },
  { key: "applications", header: "Applications", value: (v) => v._count.applications, numeric: true },
];

export function VacanciesTable({ vacancies }: { vacancies: Row[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [postTarget, setPostTarget] = useState<Row | null>(null);
  const [notify, setNotify] = useState(true);

  function doClose(v: Row) {
    startTransition(async () => {
      await closeVacancy(v.id);
      router.refresh();
      toast.success("Vacancy closed");
    });
  }

  function confirmPost() {
    if (!postTarget) return;
    const v = postTarget;
    const notifyPool = notify && !v.notifiedTalentPool;
    setPostTarget(null);
    startTransition(async () => {
      await postVacancy(v.id, notifyPool);
      router.refresh();
      toast.success(notifyPool ? "Vacancy posted — talent pool notified" : "Vacancy posted");
    });
  }

  return (
    <>
      <DataTable
        rows={vacancies}
        columns={columns}
        rowKey={(v) => v.id}
        rowHref={(v) => `/admin/careers/vacancies/${v.id}`}
        defaultSort={{ key: "status", dir: "asc" }}
        searchPlaceholder="Search title, location…"
        emptyMessage="No vacancies yet."
        actions={(v) => (
          <>
            {v.status !== "OPEN" ? (
              <Button variant="outline" size="sm" onClick={() => { setNotify(!v.notifiedTalentPool); setPostTarget(v); }}>
                Post
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => doClose(v)}>
                Close
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/careers/vacancies/${v.id}`}>Edit</Link>
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

      {postTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPostTarget(null)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="post-title" className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
            <h2 id="post-title" className="font-display text-lg font-semibold">Post “{postTarget.title}”?</h2>
            <p className="mt-2 text-sm text-muted-foreground">This makes the vacancy visible on the public careers page and opens it for applications.</p>
            {!postTarget.notifiedTalentPool ? (
              <label className="mt-4 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-4 w-4 rounded border-input" />
                Email the talent pool about this opening
              </label>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground">The talent pool has already been notified about this vacancy.</p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPostTarget(null)}>Cancel</Button>
              <Button onClick={confirmPost}>Post vacancy</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
