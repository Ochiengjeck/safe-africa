import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPeriod } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { FileDown, ArrowLeft } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return projects.map((project) => ({ slug: project.slug }));
  } catch {
    // DB unreachable at build time — generate pages on demand instead.
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const project = await prisma.project.findUnique({ where: { slug } });
  return project ? { title: project.title, description: project.overview.slice(0, 160) } : {};
}

export default async function ProjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      thematicAreas: { select: { slug: true, title: true } },
      images: { orderBy: { order: "asc" } },
      attachments: true,
    },
  });
  if (!project || project.status !== "PUBLISHED") notFound();

  const facts = [
    { label: "Client", value: project.client },
    { label: "Location", value: project.location },
    { label: "Period", value: formatPeriod(project.periodStart, project.periodEnd) },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      <h1 className="font-display mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">{project.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.thematicAreas.map((area) => (
          <Link key={area.slug} href={`/thematic-areas/${area.slug}`}>
            <Badge variant="secondary">{area.title}</Badge>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-8">
          {project.coverImage && (
            <Image
              src={project.coverImage}
              alt=""
              width={900}
              height={500}
              className="w-full rounded-xl object-cover"
            />
          )}
          <section>
            <h2 className="font-display text-xl font-semibold">Project overview</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{project.overview}</p>
          </section>
          <section>
            <h2 className="font-display text-xl font-semibold">SAFE Africa&apos;s role</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{project.role}</p>
          </section>
          <section className="rounded-xl border-l-4 border-brand-leaf bg-muted/50 p-6">
            <h2 className="font-display text-xl font-semibold">Scale and results</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{project.scaleResults}</p>
          </section>

          {project.images.length > 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold">Gallery</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {project.images.map((image) => (
                  <figure key={image.id}>
                    <Image
                      src={image.url}
                      alt={image.caption ?? ""}
                      width={600}
                      height={400}
                      className="aspect-[3/2] w-full rounded-lg object-cover"
                    />
                    {image.caption && (
                      <figcaption className="mt-1 text-xs text-muted-foreground">{image.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 self-start">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Project facts</h2>
            <dl className="mt-4 space-y-4">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs font-medium uppercase text-muted-foreground">{fact.label}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          {project.attachments.length > 0 && (
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Downloads</h2>
              <ul className="mt-4 space-y-3">
                {project.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      <FileDown className="h-4 w-4" /> {attachment.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
