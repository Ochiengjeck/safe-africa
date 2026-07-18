import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { CmsIcon } from "@/components/site/icon";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;
export const metadata = {
  title: "Thematic Areas",
  description:
    "SAFE Africa works across Agriculture, Food & Nutrition Systems; Girls' & Women's Empowerment; Youth Skills & Workforce Development; Climate Change & NRM; WASH; and Social Protection.",
};

export default async function ThematicAreasPage() {
  const areas = await prisma.thematicArea.findMany({ orderBy: { order: "asc" } });
  return (
    <main>
      <PageHero
        eyebrow="Thematic areas"
        title="Where we generate evidence"
        intro="Our work spans six interconnected thematic areas, each grounded in rigorous research and a commitment to inclusive, sustainable development."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="space-y-5">
          {areas.map((area, i) => (
            <Reveal key={area.id} delay={i * 50}>
              <Link
                href={`/thematic-areas/${area.slug}`}
                className="group grid gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <CmsIcon name={area.icon} className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold group-hover:text-primary">{area.title}</h2>
                  <p className="mt-1 text-sm italic text-muted-foreground">{area.tagline}</p>
                </div>
                <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
