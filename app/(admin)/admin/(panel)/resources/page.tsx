import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <Button asChild>
          <Link href="/admin/resources/new">New resource</Link>
        </Button>
      </div>
      <Suspense>
        <ResourcesTable resources={resources} />
      </Suspense>
    </div>
  );
}
