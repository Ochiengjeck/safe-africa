import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ResourcesTable } from "./resources-table";

export const metadata = { title: "Resources — SAFE Africa CMS" };

export default async function AdminResourcesPage() {
  const resources = await prisma.resource.findMany({
    where: { deletedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { thematicArea: { select: { title: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Resources"
        subtitle="Publications, reports, and downloadable outputs."
        actions={<Button asChild><Link href="/admin/resources/new">New resource</Link></Button>}
      />
      <Suspense>
        <ResourcesTable resources={resources} />
      </Suspense>
    </div>
  );
}
