import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { plainTextToHtml } from "../lib/rich-text";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * One-off, idempotent migration: wrap existing plain-text content fields into
 * HTML paragraphs so they render correctly now that these fields use the rich
 * text editor. Values that already contain HTML are left untouched.
 */
async function main() {
  const projects = await prisma.project.findMany({ select: { id: true, overview: true, role: true, scaleResults: true } });
  for (const p of projects) {
    await prisma.project.update({
      where: { id: p.id },
      data: { overview: plainTextToHtml(p.overview), role: plainTextToHtml(p.role), scaleResults: plainTextToHtml(p.scaleResults) },
    });
  }
  console.log(`Projects: ${projects.length}`);

  const areas = await prisma.thematicArea.findMany({ select: { id: true, description: true, impact: true } });
  for (const a of areas) {
    await prisma.thematicArea.update({
      where: { id: a.id },
      data: { description: plainTextToHtml(a.description), impact: plainTextToHtml(a.impact) },
    });
  }
  console.log(`Thematic areas: ${areas.length}`);

  const services = await prisma.service.findMany({ select: { id: true, description: true } });
  for (const s of services) {
    await prisma.service.update({ where: { id: s.id }, data: { description: plainTextToHtml(s.description) } });
  }
  console.log(`Services: ${services.length}`);

  const resources = await prisma.resource.findMany({ where: { description: { not: null } }, select: { id: true, description: true } });
  for (const r of resources) {
    await prisma.resource.update({ where: { id: r.id }, data: { description: plainTextToHtml(r.description) } });
  }
  console.log(`Resources: ${resources.length}`);

  const team = await prisma.teamMember.findMany({ where: { bio: { not: null } }, select: { id: true, bio: true } });
  for (const t of team) {
    await prisma.teamMember.update({ where: { id: t.id }, data: { bio: plainTextToHtml(t.bio) } });
  }
  console.log(`Team members: ${team.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
