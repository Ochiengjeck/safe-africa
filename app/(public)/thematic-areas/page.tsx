import Link from "next/link";
import Image from "next/image";
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area, i) => (
            <Reveal key={area.id} delay={(i % 3) * 60}>
              <Link
                href={`/thematic-areas/${area.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {area.coverImage ? (
                    <Image
                      src={area.coverImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CmsIcon name={area.icon} className="h-10 w-10 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" aria-hidden="true" />
                  <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 shadow-sm">
                    <CmsIcon name={area.icon} className="h-5 w-5 text-primary" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-lg font-semibold leading-snug group-hover:text-primary">{area.title}</h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm italic text-muted-foreground">{area.tagline}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
