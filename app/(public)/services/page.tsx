import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/site/section-heading";
import { CmsIcon } from "@/components/site/icon";

export const revalidate = 3600;
export const metadata = {
  title: "Services",
  description:
    "Baseline & endline surveys, impact assessments, randomized studies, feasibility studies, financial advisory, WASH, livelihood analysis, data analytics, and more.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="What we offer"
        title="Areas of specialization"
        intro="From large-scale household surveys to enterprise financial advisory, we combine technical rigor with deep regional knowledge to deliver evidence partners can act on."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
              <CmsIcon name={service.icon} className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display mt-4 text-lg font-semibold">{service.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
