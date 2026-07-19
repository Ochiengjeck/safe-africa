import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ServicesTable } from "./services-table";

export const metadata = { title: "Services — SAFE Africa CMS" };

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Services</h1>
        <Button asChild>
          <Link href="/admin/services/new">New service</Link>
        </Button>
      </div>
      <Suspense>
        <ServicesTable services={services} />
      </Suspense>
    </div>
  );
}
