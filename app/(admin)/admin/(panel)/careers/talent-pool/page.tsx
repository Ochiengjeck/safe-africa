import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { TalentPoolTable, type TalentRow } from "./talent-pool-table";
import type { TalentStatus } from "@/lib/generated/prisma/client";

export const metadata = { title: "Talent Pool — SAFE Africa CMS" };

const TABS: { key: string; label: string; status?: TalentStatus }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active", status: "ACTIVE" },
  { key: "invited", label: "Invited", status: "INVITED" },
  { key: "archived", label: "Archived", status: "ARCHIVED" },
];

export default async function TalentPoolPage(props: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await props.searchParams;
  const activeTab = TABS.find((t) => t.key === status) ?? TABS[0];

  const [entries, counts] = await Promise.all([
    prisma.talentPoolEntry.findMany({
      where: { deletedAt: null, ...(activeTab.status ? { status: activeTab.status } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.talentPoolEntry.groupBy({ by: ["status"], where: { deletedAt: null }, _count: true }),
  ]);

  const countFor = (tab: (typeof TABS)[number]) =>
    tab.status ? counts.find((c) => c.status === tab.status)?._count ?? 0 : counts.reduce((s, c) => s + c._count, 0);

  const rows: TalentRow[] = entries.map((e) => ({
    id: e.id,
    fullName: e.fullName,
    professionalTitle: e.professionalTitle,
    specializations: e.specializations.join(", "),
    location: e.location ?? "—",
    status: e.status,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Talent pool</h1>
        <p className="text-sm text-muted-foreground">Professionals who signed up to be considered for future openings.</p>
      </div>

      <nav aria-label="Filter talent pool" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={tab.key === "all" ? "/admin/careers/talent-pool" : `/admin/careers/talent-pool?status=${tab.key}`}
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

      <TalentPoolTable rows={rows} />
    </div>
  );
}
