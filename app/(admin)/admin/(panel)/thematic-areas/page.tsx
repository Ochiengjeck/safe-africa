import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { AreasTable } from "./areas-table";

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
      <Suspense>
        <AreasTable areas={areas} />
      </Suspense>
    </div>
  );
}
