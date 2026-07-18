import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteThematicArea } from "@/lib/actions/thematic-areas";

export const metadata = { title: "Thematic Areas — SAFE Africa CMS" };

export default async function AdminThematicAreasPage() {
  const areas = await prisma.thematicArea.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Thematic areas</h1>
        <Button asChild>
          <Link href="/admin/thematic-areas/new">New area</Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Tagline</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {areas.map((area) => (
              <tr key={area.id} className="border-b last:border-0">
                <td className="px-4 py-3">{area.order}</td>
                <td className="max-w-64 truncate px-4 py-3 font-medium">{area.title}</td>
                <td className="max-w-80 truncate px-4 py-3 text-muted-foreground">{area.tagline}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/thematic-areas/${area.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deleteThematicArea.bind(null, area.id)} />
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
