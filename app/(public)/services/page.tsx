import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { CmsIcon } from "@/components/site/icon";
import { RichTextContent } from "@/components/rich-text/content";

export const revalidate = 3600;
export const metadata = {
  title: "Services",
  description:
    "Baseline & endline surveys, impact assessments, randomized studies, feasibility studies, financial advisory, WASH, livelihood analysis, data analytics, and more.",
};

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  return (
    <main>
      <PageHero
        eyebrow="What we offer"
        title="Areas of specialization"
        intro="From large-scale household surveys to enterprise financial advisory, we combine technical rigor with deep regional knowledge to deliver evidence partners can act on."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 3) * 70}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                  <CmsIcon name={service.icon} className="h-5 w-5 text-primary" />
                </div>
                <h2 className="font-display mt-4 text-lg font-semibold">{service.title}</h2>
                <RichTextContent html={service.description} className="prose prose-sm prose-neutral dark:prose-invert mt-2 max-w-none text-muted-foreground" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
