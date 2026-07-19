import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPeriod } from "@/lib/format";
import { CmsIcon } from "@/components/site/icon";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const areas = await prisma.thematicArea.findMany({ select: { slug: true } });
    return areas.map((area) => ({ slug: area.slug }));
  } catch {
    // DB unreachable at build time — generate pages on demand instead.
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const area = await prisma.thematicArea.findUnique({ where: { slug } });
  return area ? { title: area.title, description: area.tagline } : {};
}

export default async function ThematicAreaPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const area = await prisma.thematicArea.findUnique({
    where: { slug },
    include: {
      projects: {
        where: { status: "PUBLISHED", deletedAt: null },
        orderBy: { periodStart: "desc" },
      },
      resources: { where: { deletedAt: null }, orderBy: { publishedAt: "desc" }, take: 6 },
    },
  });
  if (!area) notFound();

  return (
    <main>
      <section className="bg-sidebar text-sidebar-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <CmsIcon name={area.icon} className="h-9 w-9 text-brand-gold" />
          <h1 className="font-display mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{area.title}</h1>
          <p className="mt-3 max-w-2xl text-lg italic opacity-85">{area.tagline}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-2xl font-semibold">What we do</h2>
            <p className="mt-4 whitespace-pre-line text-muted-foreground">{area.description}</p>
          </section>
          <section className="rounded-xl border-l-4 border-brand-leaf bg-muted/50 p-6">
            <h2 className="font-display text-2xl font-semibold">Our impact</h2>
            <p className="mt-4 whitespace-pre-line text-muted-foreground">{area.impact}</p>
          </section>

          {area.projects.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-semibold">Related projects</h2>
              <div className="mt-5 space-y-4">
                {area.projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group block rounded-xl border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {formatPeriod(project.periodStart, project.periodEnd)} · {project.client}
                    </p>
                    <h3 className="font-display mt-2 font-semibold group-hover:text-primary">{project.title}</h3>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 self-start">
          {area.resources.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold">Related resources</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {area.resources.map((resource) => (
                  <li key={resource.id}>
                    <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl bg-primary p-6 text-primary-foreground">
            <h2 className="font-display text-lg font-semibold">Work with us in this area</h2>
            <p className="mt-2 text-sm opacity-90">
              Talk to our team about research, evaluation, or advisory support.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-orange px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
