import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { InterviewsTable, OffersTable, type InterviewRow } from "./interviews-table";
import type { InterviewStatus, Prisma } from "@/lib/generated/prisma/client";

export const metadata = { title: "Interviews — SAFE Africa CMS" };

const TABS = [
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "offers", label: "Offers" },
] as const;

function whenLabel(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

const MODE_LABEL = { VIDEO: "Video call", PHONE: "Phone call", IN_PERSON: "In person" };

export default async function InterviewsPage(props: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await props.searchParams;
  const activeTab = TABS.find((t) => t.key === tab) ?? TABS[0];

  const where: Prisma.InterviewWhereInput =
    activeTab.key === "offers"
      ? { deletedAt: null, status: "PASSED" }
      : activeTab.key === "completed"
        ? { deletedAt: null, status: { in: ["COMPLETED", "PASSED", "FAILED"] as InterviewStatus[] } }
        : { deletedAt: null, status: { in: ["SCHEDULED", "CANCELLED"] as InterviewStatus[] } };

  const [interviews, counts] = await Promise.all([
    prisma.interview.findMany({ where, orderBy: { scheduledAt: "desc" } }),
    prisma.interview.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
  ]);

  const count = (key: string) => {
    const by = (s: InterviewStatus) => counts.find((c) => c.status === s)?._count ?? 0;
    if (key === "offers") return by("PASSED");
    if (key === "completed") return by("COMPLETED") + by("PASSED") + by("FAILED");
    return by("SCHEDULED") + by("CANCELLED");
  };

  const rows: InterviewRow[] = interviews.map((i) => ({
    id: i.id,
    candidateName: i.candidateName,
    candidateEmail: i.candidateEmail,
    positionTitle: i.positionTitle,
    scheduledAt: whenLabel(i.scheduledAt),
    mode: MODE_LABEL[i.mode],
    status: i.status,
    offerStatus: i.offerStatus,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Interviews</h1>
        <Button asChild>
          <Link href="/admin/careers/interviews/new">Schedule interview</Link>
        </Button>
      </div>

      <nav aria-label="Filter interviews" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "scheduled" ? "/admin/careers/interviews" : `/admin/careers/interviews?tab=${t.key}`}
            aria-current={activeTab.key === t.key ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab.key === t.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            {t.label} <span className="opacity-70">({count(t.key)})</span>
          </Link>
        ))}
      </nav>

      {activeTab.key === "offers" ? <OffersTable rows={rows} /> : <InterviewsTable rows={rows} />}
    </div>
  );
}
