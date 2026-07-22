import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ApplicationsGroup, type AppRow } from "./applications-group";
import { defaultApplicationFields, type FormField } from "@/lib/careers/form-fields";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Applications — SAFE Africa CMS" };

const TABS: { key: string; label: string; status?: ApplicationStatus }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New", status: "NEW" },
  { key: "reviewed", label: "Reviewed", status: "REVIEWED" },
  { key: "shortlisted", label: "Shortlisted", status: "SHORTLISTED" },
  { key: "rejected", label: "Rejected", status: "REJECTED" },
];

export default async function ApplicationsInboxPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const activeTab = TABS.find((tab) => tab.key === status) ?? TABS[0];

  const [applications, counts] = await Promise.all([
    prisma.application.findMany({
      where: { deletedAt: null, ...(activeTab.status ? { status: activeTab.status } : {}) },
      orderBy: { createdAt: "desc" },
      include: { vacancy: { select: { id: true, title: true, form: { select: { fields: true } } } } },
    }),
    prisma.application.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
  ]);

  const countFor = (tab: (typeof TABS)[number]) =>
    tab.status
      ? counts.find((c) => c.status === tab.status)?._count ?? 0
      : counts.reduce((sum, c) => sum + c._count, 0);

  // Group applications per vacancy (preserving the ordering).
  const groups = new Map<string, { title: string; fields: FormField[]; rows: AppRow[] }>();
  for (const app of applications) {
    let group = groups.get(app.vacancy.id);
    if (!group) {
      const fields = (app.vacancy.form?.fields as FormField[] | undefined) ?? defaultApplicationFields();
      group = { title: app.vacancy.title, fields, rows: [] };
      groups.set(app.vacancy.id, group);
    }
    group.rows.push({
      id: app.id,
      name: app.name,
      email: app.email,
      phone: app.phone,
      status: app.status,
      received: formatDate(app.createdAt),
      cvUrl: app.cvUrl,
      coverLetter: app.coverLetter,
      answers: (app.answers as Record<string, unknown> | null) ?? null,
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Applications</h1>

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

      {applications.length === 0 ? (
        <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          {activeTab.status ? (
            <>
              No {activeTab.label.toLowerCase()} applications.{" "}
              <Link href="/admin/careers/applications" className="text-primary underline">Show all</Link>
            </>
          ) : (
            "No applications yet."
          )}
        </p>
      ) : (
        <div className="space-y-10">
          {[...groups.entries()].map(([id, group]) => (
            <ApplicationsGroup key={id} vacancyTitle={group.title} rows={group.rows} fields={group.fields} />
          ))}
        </div>
      )}
    </div>
  );
}
