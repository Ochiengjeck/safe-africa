import { prisma } from "@/lib/prisma";
import { TeamManager } from "./team-manager";

export const metadata = { title: "Team — SAFE Africa CMS" };

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ where: { deletedAt: null }, orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Team members</h1>
      <TeamManager members={members} />
    </div>
  );
}
