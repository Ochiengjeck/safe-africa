import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/content";
import { formatPeriod } from "@/lib/format";
import { CmsIcon } from "@/components/site/icon";
import { SectionHeading } from "@/components/site/section-heading";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

type Hero = {
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};
type Stats = { stats: { value: string; label: string }[] };
type Clients = { title: string; segments: { name: string; description: string }[] };
type Cta = { title: string; body: string; button: { label: string; href: string } };

export default async function HomePage() {
  const [hero, stats, clients, cta, thematicAreas, featuredProjects, services] = await Promise.all([
    getSection<Hero>("home.hero", {
      title: "Advancing Data-Driven Insights to Improve Livelihoods",
      subtitle: "Research, evaluation, and advisory services across Africa.",
      primaryCta: { label: "Explore Our Work", href: "/projects" },
      secondaryCta: { label: "Contact Us", href: "/contact" },
    }),
    getSection<Stats>("home.stats", { stats: [] }),
    getSection<Clients>("home.clients", { title: "Who We Work With", segments: [] }),
    getSection<Cta>("home.cta", {
      title: "Let's work together",
      body: "",
      button: { label: "Get in Touch", href: "/contact" },
    }),
    prisma.thematicArea.findMany({ orderBy: { order: "asc" } }),
    prisma.project.findMany({
      where: { status: "PUBLISHED", featured: true },
      orderBy: { periodStart: "desc" },
      take: 3,
    }),
    prisma.service.findMany({ orderBy: { order: "asc" }, take: 6 }),
  ]);

  return (
    <main>
      {/* Hero — evidence-led thesis with the data-bar signature at scale */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:py-28 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rise-in">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
              Research · Evaluation · Advisory
            </p>
            <h1 className="font-display mt-4 max-w-xl text-4xl font-extrabold leading-tight sm:text-5xl">
              {hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hero.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                {hero.primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="inline-flex items-center rounded-md border border-input px-5 py-2.5 font-medium transition-colors hover:bg-accent"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
          {/* The evidence wall: an abstract survey-data skyline in brand colors */}
          <div className="hidden items-end justify-center gap-2 lg:flex" aria-hidden="true">
            {[42, 68, 55, 88, 47, 100, 74, 60, 90, 52].map((height, i) => (
              <div
                key={i}
                className="w-7 rounded-t-md"
                style={{
                  height: `${height * 2.6}px`,
                  backgroundColor: ["var(--brand-gold)", "var(--brand-orange)", "var(--brand-leaf)", "var(--primary)", "var(--brand-blue)"][i % 5],
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats band */}
      {stats.stats.length > 0 && (
        <section className="bg-sidebar text-sidebar-foreground">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
            {stats.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-mono text-3xl font-medium text-brand-gold sm:text-4xl">{stat.value}</dd>
                <dt className="mt-2 text-sm opacity-80">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Thematic areas */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Thematic areas"
          title="Where we generate evidence"
          intro="Six interconnected areas where rigorous research and advisory work translate into stronger policies, programs, and investments."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {thematicAreas.map((area) => (
            <Link
              key={area.id}
              href={`/thematic-areas/${area.slug}`}
              className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <CmsIcon name={area.icon} className="h-7 w-7 text-primary" />
              <h3 className="font-display mt-4 text-lg font-semibold group-hover:text-primary">{area.title}</h3>
              <p className="mt-2 text-sm italic text-muted-foreground">{area.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Featured work"
                title="Recent assignments"
                intro="Selected projects delivered for leading development and research partners."
              />
              <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                All projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featuredProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {formatPeriod(project.periodStart, project.periodEnd)}
                  </p>
                  <h3 className="font-display mt-3 text-lg font-semibold leading-snug group-hover:text-primary">
                    {project.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{project.overview}</p>
                  <p className="mt-auto pt-4 text-sm font-medium text-brand-orange">{project.client}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services strip */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="What we offer" title="Areas of specialization" />
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.id} className="flex items-start gap-3">
              <CmsIcon name={service.icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand-leaf" />
              <div>
                <p className="font-medium">{service.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Client segments */}
      {clients.segments.length > 0 && (
        <section className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <SectionHeading eyebrow="Partners" title={clients.title} />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {clients.segments.map((segment) => (
                <div key={segment.name} className="rounded-xl border-t-4 border-brand-gold bg-card p-5 shadow-sm">
                  <h3 className="font-display font-semibold">{segment.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{segment.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold">{cta.title}</h2>
            {cta.body && <p className="mt-3 opacity-90">{cta.body}</p>}
          </div>
          <Link
            href={cta.button.href}
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange px-6 py-3 font-medium text-white shadow-md transition-opacity hover:opacity-90"
          >
            {cta.button.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
