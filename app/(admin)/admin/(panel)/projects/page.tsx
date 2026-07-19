import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/new">New project</Link>
        </Button>
      </div>
      <Suspense>
        <ProjectsTable projects={projects} />
      </Suspense>
    </div>
  );
}
