import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { TeamManager } from "./team-manager";

export const metadata = { title: "Team — SAFE Africa CMS" };

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Team members" subtitle="The people shown on your About page." />
      <TeamManager members={members} />
    </div>
  );
}
