import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { ServicesTable } from "./services-table";

export const metadata = { title: "Services — SAFE Africa CMS" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Services"
        subtitle="The offerings listed on your services page."
        actions={<Button asChild><Link href="/admin/services/new">New service</Link></Button>}
      />
      <Suspense>
        <ServicesTable services={services} />
      </Suspense>
    </div>
  );
}
