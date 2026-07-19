import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { FolderKanban, FileText, Megaphone, Mail, Inbox } from "lucide-react";

export const metadata = { title: "Dashboard — SAFE Africa CMS" };

export default async function AdminDashboard() {
  const live = { deletedAt: null } as const;
  const [
    projects,
    resources,
    vacancies,
    unreadMessages,
    newApplications,
    latestMessages,
    latestApplications,
    recentProjects,
    recentPosts,
    recentResources,
  ] = await Promise.all([
    prisma.project.count({ where: live }),
    prisma.resource.count({ where: live }),
    prisma.vacancy.count({ where: { status: "OPEN", ...live } }),
    prisma.contactMessage.count({ where: { read: false, ...live } }),
    prisma.application.count({ where: { status: "NEW" } }),
    prisma.contactMessage.findMany({ where: live, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vacancy: { select: { title: true } } },
    }),
    prisma.project.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    prisma.post.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
    prisma.resource.findMany({ where: live, orderBy: { updatedAt: "desc" }, take: 3, select: { id: true, title: true, updatedAt: true } }),
  ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects", icon: FolderKanban, color: "text-brand-leaf bg-brand-leaf/10" },
    { label: "Resources", value: resources, href: "/admin/resources", icon: FileText, color: "text-brand-blue bg-brand-blue/10" },
    { label: "Open vacancies", value: vacancies, href: "/admin/careers", icon: Megaphone, color: "text-brand-gold bg-brand-gold/10" },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages", icon: Mail, color: "text-brand-orange-deep bg-brand-orange-deep/10" },
    { label: "New applications", value: newApplications, href: "/admin/careers/applications?status=new", icon: Inbox, color: "text-primary bg-primary/10" },
  ];

  const recentEdits = [
    ...recentProjects.map((p) => ({ kind: "Project", href: `/admin/projects/${p.id}`, title: p.title, at: p.updatedAt })),
    ...recentPosts.map((p) => ({ kind: "Post", href: `/admin/media/${p.id}`, title: p.title, at: p.updatedAt })),
    ...recentResources.map((r) => ({ kind: "Resource", href: `/admin/resources/${r.id}`, title: r.title, at: r.updatedAt })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/admin/projects/new">New project</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/media/new">New post</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/resources/new">New resource</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="pt-6">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="mt-3 font-mono text-3xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recently updated</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentEdits.length === 0 && <p className="text-sm text-muted-foreground">No content yet.</p>}
            {recentEdits.map((edit) => (
              <Link key={edit.href} href={edit.href} className="flex items-start justify-between gap-3 text-sm hover:underline">
                <span className="min-w-0">
                  <Badge variant="secondary" className="mr-1.5">{edit.kind}</Badge>
                  <span className="font-medium">{edit.title}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatDate(edit.at)}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestMessages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
            {latestMessages.map((message) => (
              <div key={message.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {message.name} {!message.read && <Badge className="ml-1">new</Badge>}
                  </p>
                  <p className="truncate text-muted-foreground">{message.subject ?? message.message}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latest applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestApplications.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
            {latestApplications.map((application) => (
              <div key={application.id} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{application.name}</p>
                  <p className="truncate text-muted-foreground">{application.vacancy.title}</p>
                </div>
                <Badge variant={application.status === "NEW" ? "default" : "secondary"}>
                  {application.status.toLowerCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
