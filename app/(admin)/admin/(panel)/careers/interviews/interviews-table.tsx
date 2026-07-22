"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { setInterviewOutcome, sendOffer, updateOfferStatus, deleteInterview } from "@/lib/actions/interviews";
import { restoreItem } from "@/lib/actions/trash";
import type { InterviewStatus, OfferStatus } from "@/lib/generated/prisma/client";

export type InterviewRow = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  scheduledAt: string;
  mode: string;
  status: InterviewStatus;
  offerStatus: OfferStatus;
};

const STATUS_VARIANT: Record<InterviewStatus, "default" | "secondary" | "outline"> = {
  SCHEDULED: "default",
  COMPLETED: "secondary",
  PASSED: "default",
  FAILED: "outline",
  CANCELLED: "outline",
};

const OUTCOMES: InterviewStatus[] = ["SCHEDULED", "COMPLETED", "PASSED", "FAILED", "CANCELLED"];
const SELECT_CLASS = "h-8 rounded-md border border-input bg-transparent px-2 text-xs";

function baseColumns(): Column<InterviewRow>[] {
  return [
    { key: "candidateName", header: "Candidate", value: (r) => r.candidateName, cell: (r) => <span className="font-medium">{r.candidateName}</span> },
    { key: "positionTitle", header: "Position", value: (r) => r.positionTitle },
    { key: "scheduledAt", header: "When", value: (r) => r.scheduledAt, cell: (r) => <span className="whitespace-nowrap font-mono text-xs">{r.scheduledAt}</span> },
    { key: "mode", header: "Format", value: (r) => r.mode, hideOnMobile: true },
  ];
}

export function InterviewsTable({ rows }: { rows: InterviewRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const columns: Column<InterviewRow>[] = [
    ...baseColumns(),
    { key: "status", header: "Status", value: (r) => r.status, cell: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge> },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowKey={(r) => r.id}
      defaultSort={{ key: "scheduledAt", dir: "desc" }}
      searchPlaceholder="Search candidate, position…"
      emptyMessage="No interviews here."
      actions={(r) => (
        <>
          <select
            aria-label="Set outcome"
            className={SELECT_CLASS}
            value={r.status}
            onChange={(e) =>
              startTransition(async () => {
                await setInterviewOutcome(r.id, e.target.value as InterviewStatus);
                router.refresh();
                toast.success("Outcome updated");
              })
            }
          >
            {OUTCOMES.map((s) => (
              <option key={s} value={s}>{s.toLowerCase()}</option>
            ))}
          </select>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/careers/interviews/${r.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deleteInterview.bind(null, r.id)}
            restore={restoreItem.bind(null, "interview", r.id)}
            resourceLabel={`interview with “${r.candidateName}”`}
          />
        </>
      )}
    />
  );
}

const OFFER_VARIANT: Record<OfferStatus, "default" | "secondary" | "outline"> = {
  NONE: "outline",
  SENT: "secondary",
  ACCEPTED: "default",
  DECLINED: "outline",
};

export function OffersTable({ rows }: { rows: InterviewRow[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [offerTarget, setOfferTarget] = useState<InterviewRow | null>(null);
  const [notes, setNotes] = useState("");

  const columns: Column<InterviewRow>[] = [
    ...baseColumns(),
    { key: "offerStatus", header: "Offer", value: (r) => r.offerStatus, cell: (r) => <Badge variant={OFFER_VARIANT[r.offerStatus]}>{r.offerStatus.toLowerCase()}</Badge> },
  ];

  function confirmOffer() {
    if (!offerTarget) return;
    const id = offerTarget.id;
    const body = notes;
    setOfferTarget(null);
    setNotes("");
    startTransition(async () => {
      await sendOffer(id, body);
      router.refresh();
      toast.success("Offer sent");
    });
  }

  return (
    <>
      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        defaultSort={{ key: "scheduledAt", dir: "desc" }}
        searchPlaceholder="Search candidate, position…"
        emptyMessage="No candidates have passed an interview yet."
        actions={(r) => (
          <>
            {r.offerStatus === "NONE" || r.offerStatus === "DECLINED" ? (
              <Button variant="outline" size="sm" onClick={() => setOfferTarget(r)}>
                Send offer
              </Button>
            ) : (
              <select
                aria-label="Offer status"
                className={SELECT_CLASS}
                value={r.offerStatus}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateOfferStatus(r.id, e.target.value as OfferStatus);
                    router.refresh();
                    toast.success("Offer status updated");
                  })
                }
              >
                <option value="SENT">sent</option>
                <option value="ACCEPTED">accepted</option>
                <option value="DECLINED">declined</option>
              </select>
            )}
          </>
        )}
      />

      {offerTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOfferTarget(null)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-labelledby="offer-title" className="relative w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
            <h2 id="offer-title" className="font-display text-lg font-semibold">Send offer to {offerTarget.candidateName}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{offerTarget.positionTitle}</p>
            <label className="mt-4 block space-y-1 text-sm font-medium">
              Message (optional)
              <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add any offer details, start date, or next steps…" />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setOfferTarget(null)}>Cancel</Button>
              <Button onClick={confirmOffer}>Send offer email</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
