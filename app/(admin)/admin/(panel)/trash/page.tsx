import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { formatDate } from "@/lib/format";
import { TrashList, type TrashEntry } from "./trash-list";

export const metadata = { title: "Trash — SAFE Africa CMS" };

export default async function TrashPage() {
  const session = await requireSession();
  const deleted = { deletedAt: { not: null } } as const;

  const [projects, resources, vacancies, posts, galleryImages, teamMembers, messages] = await Promise.all([
    prisma.project.findMany({ where: deleted, select: { id: true, title: true, deletedAt: true } }),
    prisma.resource.findMany({ where: deleted, select: { id: true, title: true, deletedAt: true } }),
    prisma.vacancy.findMany({ where: deleted, select: { id: true, title: true, deletedAt: true } }),
    prisma.post.findMany({ where: deleted, select: { id: true, title: true, deletedAt: true } }),
    prisma.galleryImage.findMany({ where: deleted, select: { id: true, caption: true, deletedAt: true } }),
    prisma.teamMember.findMany({ where: deleted, select: { id: true, name: true, deletedAt: true } }),
    prisma.contactMessage.findMany({ where: deleted, select: { id: true, subject: true, name: true, deletedAt: true } }),
  ]);

  const entries: TrashEntry[] = [
    ...projects.map((p) => ({ kind: "project" as const, kindLabel: "Project", id: p.id, title: p.title, deletedAt: formatDate(p.deletedAt!) })),
    ...resources.map((r) => ({ kind: "resource" as const, kindLabel: "Resource", id: r.id, title: r.title, deletedAt: formatDate(r.deletedAt!) })),
    ...vacancies.map((v) => ({ kind: "vacancy" as const, kindLabel: "Vacancy", id: v.id, title: v.title, deletedAt: formatDate(v.deletedAt!) })),
    ...posts.map((p) => ({ kind: "post" as const, kindLabel: "News/Event", id: p.id, title: p.title, deletedAt: formatDate(p.deletedAt!) })),
    ...galleryImages.map((g) => ({ kind: "galleryImage" as const, kindLabel: "Gallery image", id: g.id, title: g.caption ?? "(no caption)", deletedAt: formatDate(g.deletedAt!) })),
    ...teamMembers.map((t) => ({ kind: "teamMember" as const, kindLabel: "Team member", id: t.id, title: t.name, deletedAt: formatDate(t.deletedAt!) })),
    ...messages.map((m) => ({ kind: "contactMessage" as const, kindLabel: "Message", id: m.id, title: m.subject ?? `Message from ${m.name}`, deletedAt: formatDate(m.deletedAt!) })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Trash</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deleted items live here until restored{session.user.role === "SUPER_ADMIN" ? " or permanently removed" : ""}.
          They are hidden from the public website.
        </p>
      </div>
      <TrashList entries={entries} canPurge={session.user.role === "SUPER_ADMIN"} />
    </div>
  );
}
