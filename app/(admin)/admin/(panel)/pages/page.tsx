import { prisma } from "@/lib/prisma";
import { SectionEditor } from "./section-editor";

export const metadata = { title: "Page Content — SAFE Africa CMS" };

const SECTION_LABELS: Record<string, string> = {
  "home.hero": "Homepage — hero",
  "home.stats": "Homepage — impact statistics",
  "home.clients": "Homepage — who we work with",
  "home.cta": "Homepage — call to action",
  "about.overview": "About — overview",
  "about.mission": "About — mission & vision",
  "about.values": "About — values",
  "about.footprint": "About — geographic footprint",
  "about.approach": "About — approach",
};

export default async function AdminPagesPage() {
  const sections = await prisma.pageSection.findMany({ orderBy: { key: "asc" } });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Page content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Structured content blocks for the homepage and about page, edited as JSON. Changes publish
          immediately.
        </p>
      </div>
      <div className="space-y-4">
        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            sectionKey={section.key}
            label={SECTION_LABELS[section.key] ?? section.key}
            content={JSON.stringify(section.content, null, 2)}
          />
        ))}
      </div>
    </div>
  );
}
