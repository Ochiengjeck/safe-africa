import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/rich-text/content";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;
export const metadata = {
  title: "Media & Events",
  description:
    "Updates on conferences, workshops, training sessions, project launches, field activities, partnerships, and community impact initiatives from SAFE Africa.",
};

export default async function MediaEventsPage() {
  const [posts, gallery] = await Promise.all([
    prisma.post.findMany({ where: { published: true, deletedAt: null }, orderBy: { publishedAt: "desc" } }),
    prisma.galleryImage.findMany({ where: { deletedAt: null }, orderBy: [{ order: "asc" }, { createdAt: "desc" }], take: 12 }),
  ]);

  return (
    <main>
      <PageHero
        eyebrow="Media & events"
        title="News, events, and highlights"
        intro="Updates from conferences, workshops, project launches, field activities, and partnerships showcasing SAFE Africa's contribution to evidence-based development."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          News and event updates will appear here soon.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {post.coverImage && (
                <Image
                  src={post.coverImage}
                  alt=""
                  width={700}
                  height={400}
                  className="aspect-[7/4] w-full object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <Badge variant="secondary">{post.type === "NEWS" ? "News" : "Event"}</Badge>
                  <span>{formatDate(post.eventDate ?? post.publishedAt)}</span>
                  {post.eventLocation && <span>· {post.eventLocation}</span>}
                </div>
                <h2 className="font-display mt-3 text-xl font-semibold">{post.title}</h2>
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-muted-foreground">{post.excerpt}</p>
                ) : (
                  <RichTextContent
                    html={post.body}
                    className="prose prose-sm prose-neutral dark:prose-invert mt-2 line-clamp-4 max-w-none"
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {gallery.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Photo gallery" title="Moments from the field" />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.map((image) => (
              <figure key={image.id} className="group relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={image.url}
                  alt={image.caption ?? ""}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {image.caption && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs text-white">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}
      </div>
    </main>
  );
}
