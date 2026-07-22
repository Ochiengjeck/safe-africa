import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { BarList, type BarItem } from "@/components/admin/bar-list";
import { formatDate } from "@/lib/format";
import { FolderKanban, FileText, Megaphone, Inbox, CalendarClock, UsersRound, Award, Layers } from "lucide-react";

export const metadata = { title: "Dashboard — SAFE Africa CMS" };

function pick<R extends { _count: number }>(rows: R[], match: (r: R) => boolean): number {
  return rows.find(match)?._count ?? 0;
}

export default async function AdminDashboard() {
  const live = { deletedAt: null } as const;

  const [
    resources,
    thematicAreas,
    team,
    projectsByStatus,
    resourcesByType,
    vacanciesByStatus,
    applicationsByStatus,
    interviewsByStatus,
    talentByStatus,
    offersSent,
    unreadMessages,
    topVacancies,
    recentProjects,
    recentPosts,
    recentResources,
    latestMessages,
    latestApplications,
  ] = await Promise.all([
    prisma.resource.count({ where: live }),
    prisma.thematicArea.count(),
    prisma.teamMember.count({ where: live }),
    prisma.project.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.resource.groupBy({ by: ["type"], where: live, _count: true }),
    prisma.vacancy.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.application.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.interview.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.talentPoolEntry.groupBy({ by: ["status"], where: live, _count: true }),
    prisma.interview.count({ where: { ...live, offerStatus: { in: ["SENT", "ACCEPTED"] } } }),
    prisma.contactMessage.count({ where: { read: false, ...live } }),
    prisma.vacancy.findMany({
      where: live,
      orderBy: { applications: { _count: "desc" } },
      take: 5,
      select: { id: true, title: true, _count: { select: { applications: { where: live } } } },
    }),
    prisma.project.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    prisma.post.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    prisma.resource.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    prisma.contactMessage.findMany({ where: live, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.application.findMany({ where: live, orderBy: { createdAt: "desc" }, take: 5, include: { vacancy: { select: { title: true } } } }),
  ]);

  const publishedProjects = pick(projectsByStatus, (r) => r.status === "PUBLISHED");
  const openVacancies = pick(vacanciesByStatus, (r) => r.status === "OPEN");
  const newApplications = pick(applicationsByStatus, (r) => r.status === "NEW");
  const scheduledInterviews = pick(interviewsByStatus, (r) => r.status === "SCHEDULED");
  const activeTalent = pick(talentByStatus, (r) => r.status === "ACTIVE");
  const totalApplications = applicationsByStatus.reduce((s, r) => s + r._count, 0);

  const kpis = [
    { label: "Published projects", value: publishedProjects, icon: FolderKanban, accent: "leaf" as const, href: "/admin/projects", sub: `${pick(projectsByStatus, (r) => r.status === "DRAFT")} in draft` },
    { label: "Resources", value: resources, icon: FileText, accent: "blue" as const, href: "/admin/resources", sub: `${thematicAreas} thematic areas` },
    { label: "Open vacancies", value: openVacancies, icon: Megaphone, accent: "gold" as const, href: "/admin/careers/vacancies", sub: `${pick(vacanciesByStatus, (r) => r.status === "DRAFT")} draft` },
    { label: "New applications", value: newApplications, icon: Inbox, accent: "orange" as const, href: "/admin/careers/applications?status=new", sub: `${totalApplications} total` },
    { label: "Interviews scheduled", value: scheduledInterviews, icon: CalendarClock, accent: "primary" as const, href: "/admin/careers/interviews", sub: `${offersSent} offers sent` },
    { label: "Talent pool", value: activeTalent, icon: UsersRound, accent: "plum" as const, href: "/admin/careers/talent-pool", sub: "active candidates" },
  ];

  const pipeline: BarItem[] = [
    { label: "New", value: newApplications, accent: "blue" },
    { label: "Reviewed", value: pick(applicationsByStatus, (r) => r.status === "REVIEWED"), accent: "gold" },
    { label: "Shortlisted", value: pick(applicationsByStatus, (r) => r.status === "SHORTLISTED"), accent: "leaf" },
    { label: "Rejected", value: pick(applicationsByStatus, (r) => r.status === "REJECTED"), accent: "muted" },
  ];

  const projectMix: BarItem[] = [
    { label: "Published", value: publishedProjects, accent: "leaf" },
    { label: "Draft", value: pick(projectsByStatus, (r) => r.status === "DRAFT"), accent: "gold" },
    { label: "Archived", value: pick(projectsByStatus, (r) => r.status === "ARCHIVED"), accent: "muted" },
  ];

  const TYPE_LABELS: Record<string, string> = { PUBLICATION: "Publications", REPORT: "Reports", POLICY_BRIEF: "Policy briefs", TOOLKIT: "Toolkits", RESEARCH: "Research" };
  const resourceMix: BarItem[] = resourcesByType.map((r) => ({ label: TYPE_LABELS[r.type] ?? r.type, value: r._count, accent: "blue" as const }));

  const vacancyApps: BarItem[] = topVacancies.map((v) => ({ label: v.title, value: v._count.applications, accent: "orange" as const }));

  const recentEdits = [
    ...recentProjects.map((p) => ({ kind: "Project", href: `/admin/projects/${p.id}`, title: p.title, at: p.updatedAt })),
    ...recentPosts.map((p) => ({ kind: "Post", href: `/admin/media/${p.id}`, title: p.title, at: p.updatedAt })),
    ...recentResources.map((r) => ({ kind: "Resource", href: `/admin/resources/${r.id}`, title: r.title, at: r.updatedAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        subtitle="Content, recruitment activity, and the latest across your site at a glance."
        actions={
          <>
            <Button asChild size="sm"><Link href="/admin/projects/new">New project</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/admin/careers/vacancies/new">New vacancy</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href="/admin/media/new">New post</Link></Button>
          </>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} icon={k.icon} accent={k.accent} sub={k.sub} href={k.href} />
        ))}
      </div>

      {/* Recruitment */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recruitment pipeline</CardTitle>
            <Link href="/admin/careers/applications" className="text-xs font-medium text-primary hover:underline">View all →</Link>
          </CardHeader>
          <CardContent className="space-y-5">
            <BarList items={pipeline} labelWidth="5.5rem" />
            <div className="grid grid-cols-3 gap-3 border-t pt-4">
              <MiniStat icon={CalendarClock} label="Interviews" value={scheduledInterviews} accent="text-brand-blue" />
              <MiniStat icon={Award} label="Offers" value={offersSent} accent="text-brand-leaf" />
              <MiniStat icon={UsersRound} label="Talent pool" value={activeTalent} accent="text-[#6d4d9a]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Applications by opening</CardTitle></CardHeader>
          <CardContent>
            {vacancyApps.length > 0 ? <BarList items={vacancyApps} labelWidth="8rem" /> : <p className="text-sm text-muted-foreground">No applications yet.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Content mix */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0"><Layers className="h-4 w-4 text-brand-leaf" /><CardTitle className="text-base">Projects</CardTitle></CardHeader>
          <CardContent><BarList items={projectMix} labelWidth="6rem" /></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0"><FileText className="h-4 w-4 text-brand-blue" /><CardTitle className="text-base">Resources</CardTitle></CardHeader>
          <CardContent>{resourceMix.length > 0 ? <BarList items={resourceMix} labelWidth="6rem" /> : <p className="text-sm text-muted-foreground">No resources yet.</p>}</CardContent>
        </Card>
      </div>

      {/* Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Recently updated</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentEdits.length === 0 && <p className="text-sm text-muted-foreground">No content yet.</p>}
            {recentEdits.map((edit) => (
              <Link key={edit.href} href={edit.href} className="flex items-start justify-between gap-3 text-sm hover:underline">
                <span className="min-w-0"><Badge variant="secondary" className="mr-1.5">{edit.kind}</Badge><span className="font-medium">{edit.title}</span></span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatDate(edit.at)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Latest messages</CardTitle>
            {unreadMessages > 0 && <Badge>{unreadMessages} unread</Badge>}
          </CardHeader>
          <CardContent className="space-y-3">
            {latestMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {latestMessages.map((m) => (
              <div key={m.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{m.name} {!m.read && <Badge className="ml-1">new</Badge>}</p>
                  <p className="truncate text-muted-foreground">{m.subject ?? m.message}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatDate(m.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Latest applications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {latestApplications.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
            {latestApplications.map((a) => (
              <Link key={a.id} href={`/admin/careers/applications/${a.id}`} className="flex items-start justify-between gap-3 text-sm hover:underline">
                <div className="min-w-0"><p className="truncate font-medium">{a.name}</p><p className="truncate text-muted-foreground">{a.vacancy.title}</p></div>
                <Badge variant={a.status === "NEW" ? "default" : "secondary"}>{a.status.toLowerCase()}</Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, accent }: { icon: typeof Layers; label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <Icon className={`mx-auto h-4 w-4 ${accent}`} aria-hidden="true" />
      <p className="font-display mt-1 text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
