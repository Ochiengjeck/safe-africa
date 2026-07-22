import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { Section } from "@/components/site/section";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { CmsIcon } from "@/components/site/icon";
import { RichTextContent } from "@/components/rich-text/content";

export const revalidate = 3600;
export const metadata = {
  title: "Services",
  description:
    "Baseline & endline surveys, impact assessments, randomized studies, feasibility studies, financial advisory, WASH, livelihood analysis, data analytics, and more.",
};

const ICON_COLORS = ["text-brand-leaf", "text-brand-orange-deep", "text-brand-gold", "text-brand-blue", "text-primary"];

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
  const featured = services.filter((service) => service.image);
  const rest = services.filter((service) => !service.image);

  return (
    <main>
      <PageHero
        eyebrow="What we offer"
        title="Areas of specialization"
        intro="From large-scale household surveys to enterprise financial advisory, we combine technical rigor with deep regional knowledge to deliver evidence partners can act on."
      />

      {featured.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="Featured specializations"
            title="Where our work speaks for itself"
            intro="A closer look at a few of the specializations behind our research, evaluation, and advisory engagements."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((service, i) => (
              <Reveal key={service.id} delay={i * 70}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-[16/9] overflow-hidden bg-secondary">
                    <Image
                      src={service.image!}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent" aria-hidden="true" />
                    <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 shadow-sm">
                      <CmsIcon name={service.icon} className="h-5 w-5 text-primary" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-lg font-semibold">{service.title}</h2>
                    <RichTextContent html={service.description} className="prose prose-sm prose-neutral dark:prose-invert mt-2 max-w-none text-muted-foreground" />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {rest.length > 0 && (
        <Section variant={featured.length > 0 ? "muted" : "default"}>
          <SectionHeading
            eyebrow="Full range"
            title="Every area we specialize in"
            intro="Technical rigor with deep regional knowledge, applied across the full breadth of our research, evaluation, and advisory practice."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((service, i) => (
              <Reveal key={service.id} delay={(i % 3) * 70}>
                <div className="h-full rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
                    <CmsIcon name={service.icon} className={`h-5 w-5 ${ICON_COLORS[i % ICON_COLORS.length]}`} />
                  </div>
                  <h2 className="font-display mt-4 text-lg font-semibold">{service.title}</h2>
                  <RichTextContent html={service.description} className="prose prose-sm prose-neutral dark:prose-invert mt-2 max-w-none text-muted-foreground" />
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}
    </main>
  );
}
