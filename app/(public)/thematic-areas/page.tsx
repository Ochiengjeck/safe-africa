import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/site/section-heading";
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
    <main className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Thematic areas"
        title="Where we generate evidence"
        intro="Our work spans six interconnected thematic areas, each grounded in rigorous research and a commitment to inclusive, sustainable development."
      />
      <div className="mt-10 space-y-5">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/thematic-areas/${area.slug}`}
            className="group grid gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <CmsIcon name={area.icon} className="h-8 w-8 text-primary" />
            <div>
              <h2 className="font-display text-xl font-semibold group-hover:text-primary">{area.title}</h2>
              <p className="mt-1 text-sm italic text-muted-foreground">{area.tagline}</p>
            </div>
            <ArrowRight className="hidden h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary sm:block" />
          </Link>
        ))}
      </div>
    </main>
  );
}
