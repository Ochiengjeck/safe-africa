import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Dashboard — SAFE Africa CMS" };

export default async function AdminDashboard() {
  const [projects, resources, vacancies, unreadMessages, newApplications, latestMessages, latestApplications] =
    await Promise.all([
      prisma.project.count(),
      prisma.resource.count(),
      prisma.vacancy.count({ where: { status: "OPEN" } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.application.count({ where: { status: "NEW" } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { vacancy: { select: { title: true } } },
      }),
    ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    { label: "Resources", value: resources, href: "/admin/resources" },
    { label: "Open vacancies", value: vacancies, href: "/admin/careers" },
    { label: "Unread messages", value: unreadMessages, href: "/admin/messages" },
    { label: "New applications", value: newApplications, href: "/admin/careers/applications" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
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
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(message.createdAt)}</span>
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
