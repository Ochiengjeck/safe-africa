import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ApplicationRow } from "./application-row";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Applications — SAFE Africa CMS" };

const TABS: { key: string; label: string; status?: ApplicationStatus }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New", status: "NEW" },
  { key: "reviewed", label: "Reviewed", status: "REVIEWED" },
  { key: "shortlisted", label: "Shortlisted", status: "SHORTLISTED" },
  { key: "rejected", label: "Rejected", status: "REJECTED" },
];

export default async function ApplicationsInboxPage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await props.searchParams;
  const activeTab = TABS.find((tab) => tab.key === status) ?? TABS[0];

  const [applications, counts] = await Promise.all([
    prisma.application.findMany({
      where: activeTab.status ? { status: activeTab.status } : {},
      orderBy: { createdAt: "desc" },
      include: { vacancy: { select: { title: true } } },
    }),
    prisma.application.groupBy({ by: ["status"], _count: true }),
  ]);

  const countFor = (tab: (typeof TABS)[number]) =>
    tab.status
      ? counts.find((c) => c.status === tab.status)?._count ?? 0
      : counts.reduce((sum, c) => sum + c._count, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Applications inbox</h1>

      <nav aria-label="Filter applications by status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/careers/applications" : `/admin/careers/applications?status=${tab.key}`}
            aria-current={activeTab.key === tab.key ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab.key === tab.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            {tab.label} <span className="opacity-70">({countFor(tab)})</span>
          </Link>
        ))}
      </nav>

      <div className="space-y-4">
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            {activeTab.status ? (
              <>
                No {activeTab.label.toLowerCase()} applications.{" "}
                <Link href="/admin/careers/applications" className="text-primary underline">
                  Show all
                </Link>
              </>
            ) : (
              "No applications yet."
            )}
          </p>
        )}
        {applications.map((application) => (
          <ApplicationRow
            key={application.id}
            application={application}
            vacancyTitle={application.vacancy.title}
            receivedAt={formatDate(application.createdAt)}
          />
        ))}
      </div>
      {applications.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Showing {applications.length} {activeTab.key === "all" ? "" : activeTab.label.toLowerCase() + " "}
          application(s). <Badge variant="outline">Tip</Badge> use the status buttons on each card to move
          candidates through the pipeline.
        </p>
      )}
    </div>
  );
}
