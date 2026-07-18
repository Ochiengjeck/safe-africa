import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPeriod } from "@/lib/format";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const revalidate = 3600;
export const metadata = {
  title: "Projects",
  description:
    "Selected assignments illustrating SAFE Africa's experience in survey implementation, evaluation, feasibility studies, and inclusive research.",
};

export default async function ProjectsPage(props: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await props.searchParams;
  const [projects, areas, totalCount] = await Promise.all([
    prisma.project.findMany({
      where: {
        status: "PUBLISHED",
        ...(area ? { thematicAreas: { some: { slug: area } } } : {}),
      },
      orderBy: { periodStart: "desc" },
      include: { thematicAreas: { select: { slug: true, title: true } } },
    }),
    prisma.thematicArea.findMany({
      orderBy: { order: "asc" },
      select: {
        slug: true,
        title: true,
        _count: { select: { projects: { where: { status: "PUBLISHED" } } } },
      },
    }),
    prisma.project.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <main>
      <PageHero
        eyebrow="Our work"
        title="Projects"
        intro="Assignments delivered for leading development and research partners, including the World Bank, IFPRI, CIFOR-ICRAF, Habitat for Humanity Kenya, and The Syngenta Group."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
      <nav aria-label="Filter projects by thematic area" className="flex flex-wrap gap-2">
        <Link
          href="/projects"
          aria-current={!area ? "true" : undefined}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !area ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          All <span className="opacity-70">({totalCount})</span>
        </Link>
        {areas.map((thematicArea) => (
          <Link
            key={thematicArea.slug}
            href={`/projects?area=${thematicArea.slug}`}
            aria-current={area === thematicArea.slug ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              area === thematicArea.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:bg-accent"
            )}
          >
            {thematicArea.title} <span className="opacity-70">({thematicArea._count.projects})</span>
          </Link>
        ))}
      </nav>

      <div className="mt-10 space-y-5">
        {projects.length === 0 && (
          <p className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
            No projects found for this thematic area yet.
          </p>
        )}
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={Math.min(i, 4) * 60}>
          <Link
            href={`/projects/${project.slug}`}
            className="group block rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              <span>{formatPeriod(project.periodStart, project.periodEnd)}</span>
              <span aria-hidden="true">·</span>
              <span>{project.location}</span>
            </div>
            <h2 className="font-display mt-3 text-xl font-semibold group-hover:text-primary">{project.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{project.overview}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-brand-orange-deep">{project.client}</span>
              {project.thematicAreas.map((thematicArea) => (
                <Badge key={thematicArea.slug} variant="secondary">
                  {thematicArea.title}
                </Badge>
              ))}
            </div>
          </Link>
          </Reveal>
        ))}
      </div>
      </div>
    </main>
  );
}
