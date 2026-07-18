import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProject } from "@/lib/actions/projects";
import { formatPeriod } from "@/lib/format";

export const metadata = { title: "Projects — SAFE Africa CMS" };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Period</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Areas</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No projects yet.
                </td>
              </tr>
            )}
            {projects.map((project) => (
              <tr key={project.id} className="border-b last:border-0">
                <td className="max-w-72 px-4 py-3">
                  <p className="truncate font-medium">{project.title}</p>
                  {project.featured && <Badge variant="secondary">featured</Badge>}
                </td>
                <td className="max-w-48 truncate px-4 py-3">{project.client}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatPeriod(project.periodStart, project.periodEnd)}</td>
                <td className="px-4 py-3">
                  <Badge variant={project.status === "PUBLISHED" ? "default" : "outline"}>
                    {project.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                  {project.thematicAreas.map((area) => area.title).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/projects/${project.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deleteProject.bind(null, project.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
