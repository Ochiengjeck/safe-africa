import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceForm } from "../service-form";

export const metadata = { title: "Edit Service — SAFE Africa CMS" };

export default async function EditServicePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit service</h1>
      <ServiceForm service={service} />
    </div>
  );
}
