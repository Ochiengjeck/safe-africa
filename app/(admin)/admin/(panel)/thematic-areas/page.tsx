import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { AreasTable } from "./areas-table";

export const metadata = { title: "Thematic Areas — SAFE Africa CMS" };

export default async function AdminThematicAreasPage() {
  const areas = await prisma.thematicArea.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Thematic areas"
        subtitle="The focus areas your projects and resources are organised under."
        actions={<Button asChild><Link href="/admin/thematic-areas/new">New area</Link></Button>}
      />
      <Suspense>
        <AreasTable areas={areas} />
      </Suspense>
    </div>
  );
}
