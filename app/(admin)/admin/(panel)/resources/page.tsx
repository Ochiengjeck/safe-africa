import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteResource } from "@/lib/actions/resources";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Resources — SAFE Africa CMS" };

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { publishedAt: "desc" },
    include: { thematicArea: { select: { title: true } } },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <Button asChild>
          <Link href="/admin/resources/new">New resource</Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Thematic area</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No resources yet.
                </td>
              </tr>
            )}
            {resources.map((resource) => (
              <tr key={resource.id} className="border-b last:border-0">
                <td className="max-w-80 truncate px-4 py-3 font-medium">{resource.title}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{resource.type.replace("_", " ").toLowerCase()}</Badge>
                </td>
                <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                  {resource.thematicArea?.title ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(resource.publishedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/resources/${resource.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deleteResource.bind(null, resource.id)} />
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
