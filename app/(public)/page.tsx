import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/content";
import { formatPeriod } from "@/lib/format";
import { CmsIcon } from "@/components/site/icon";
import { SectionHeading } from "@/components/site/section-heading";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { CountUp } from "@/components/site/count-up";
import { ArrowRight, Check } from "lucide-react";

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

const PARTNERS = ["World Bank", "IFPRI", "CIFOR-ICRAF", "Habitat for Humanity", "Syngenta Group"];
const ROW_ACCENTS = ["border-brand-leaf", "border-brand-orange", "border-brand-gold", "border-brand-blue", "border-primary", "border-brand-leaf"];
const SEGMENT_COLORS = ["text-brand-leaf", "text-brand-orange-deep", "text-brand-gold", "text-brand-blue", "text-primary"];
const SEGMENT_ICONS = ["sprout", "shield", "heart-handshake", "banknote", "users"];

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
    prisma.service.findMany({ orderBy: { order: "asc" }, take: 8 }),
  ]);

  const [spotlight, ...restProjects] = featuredProjects;
  const projectImages = ["/images/project-1.jpg", "/images/project-2.jpg", "/images/project-3.jpg"];

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="rise-in">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">
              Research · Evaluation · Advisory
            </p>
            <h1 className="font-display mt-4 max-w-xl text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
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
            <div className="mt-10 border-t pt-6">
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Trusted by leading development partners
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                {PARTNERS.map((partner) => (
                  <li key={partner} className="font-display text-sm font-semibold text-foreground/70">
                    {partner}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative rise-in">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/hero.jpg"
                alt="Young maize crop rows growing in dark fertile soil"
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sidebar/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-lg bg-background/95 px-4 py-3 shadow-md backdrop-blur">
                <span className="evidence-bars" aria-hidden="true">
                  <span /><span /><span /><span />
                </span>
                <div>
                  <p className="font-mono text-sm font-semibold">3,800 households</p>
                  <p className="text-xs text-muted-foreground">surveyed in one baseline</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact stats band */}
      {stats.stats.length > 0 && (
        <section className="bg-sidebar text-sidebar-foreground">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-14 md:grid-cols-4">
            {stats.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-mono text-3xl font-medium text-brand-gold sm:text-4xl">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-2 text-sm opacity-80">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Thematic areas — editorial split */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="self-start lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Thematic areas"
              title="Where we generate evidence"
              intro="Six interconnected areas where rigorous research and advisory work translate into stronger policies, programs, and investments."
            />
            <Link
              href="/thematic-areas"
              className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Explore all areas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div>
            {thematicAreas.map((area, i) => (
              <Reveal key={area.id} delay={i * 60}>
                <Link
                  href={`/thematic-areas/${area.slug}`}
                  className={`group flex items-center gap-5 border-b border-l-4 px-5 py-6 transition-colors first:border-t hover:bg-secondary/40 ${ROW_ACCENTS[i % ROW_ACCENTS.length]}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <CmsIcon name={area.icon} className="h-5 w-5 text-primary" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-lg font-semibold group-hover:text-primary">
                      {area.title}
                    </span>
                    <span className="mt-0.5 block truncate text-sm italic text-muted-foreground">{area.tagline}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* Featured projects — spotlight */}
      {spotlight && (
        <Section variant="muted">
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
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <Reveal>
              <Link
                href={`/projects/${spotlight.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative aspect-[16/8] overflow-hidden">
                  <Image
                    src={spotlight.coverImage ?? projectImages[0]}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {formatPeriod(spotlight.periodStart, spotlight.periodEnd)} · {spotlight.location}
                  </p>
                  <h3 className="font-display mt-3 text-2xl font-semibold leading-snug group-hover:text-primary">
                    {spotlight.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-muted-foreground">{spotlight.overview}</p>
                  <p className="mt-auto pt-5 text-sm font-semibold text-brand-orange-deep">{spotlight.client}</p>
                </div>
              </Link>
            </Reveal>
            <div className="flex flex-col gap-6">
              {restProjects.map((project, i) => (
                <Reveal key={project.id} delay={(i + 1) * 80} className="flex-1">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {formatPeriod(project.periodStart, project.periodEnd)}
                    </p>
                    <h3 className="font-display mt-2 text-lg font-semibold leading-snug group-hover:text-primary">
                      {project.title}
                    </h3>
                    <p className="mt-auto pt-4 text-sm font-semibold text-brand-orange-deep">{project.client}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Services checklist */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="What we offer"
            title="Areas of specialization"
            intro="From large-scale household surveys to enterprise financial advisory — technical rigor with deep regional knowledge."
          />
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            All services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.id} delay={(i % 4) * 60}>
              <li className="flex items-start gap-3 border-b pb-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <Check className="h-3.5 w-3.5 text-brand-leaf" />
                </span>
                <div>
                  <p className="font-medium">{service.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </Section>

      {/* Client segments */}
      {clients.segments.length > 0 && (
        <Section variant="muted">
          <SectionHeading eyebrow="Partners" title={clients.title} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {clients.segments.map((segment, i) => (
              <Reveal key={segment.name} delay={i * 60}>
                <div className="h-full rounded-xl border bg-card p-5 shadow-sm">
                  <CmsIcon name={SEGMENT_ICONS[i % SEGMENT_ICONS.length]} className={`h-6 w-6 ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}`} />
                  <h3 className="font-display mt-3 font-semibold">{segment.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{segment.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Image
          src="/images/cta.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-sidebar/85" />
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-20 text-sidebar-foreground">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{cta.title}</h2>
            {cta.body && <p className="mt-3 opacity-90">{cta.body}</p>}
          </div>
          <Link
            href={cta.button.href}
            className="inline-flex items-center gap-2 rounded-md bg-brand-orange-deep px-6 py-3 font-medium text-white shadow-md transition-opacity hover:opacity-90"
          >
            {cta.button.label} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
