import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectsTable } from "./projects-table";

export const metadata = { title: "Projects — SAFE Africa CMS" };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { periodStart: "desc" },
    include: { thematicAreas: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Projects"
        subtitle="Case studies and assignments showcased on the public site."
        actions={<Button asChild><Link href="/admin/projects/new">New project</Link></Button>}
      />
      <Suspense>
        <ProjectsTable projects={projects} />
      </Suspense>
    </div>
  );
}
