import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/site/section-heading";
import { Badge } from "@/components/ui/badge";
import { FileDown } from "lucide-react";
import { formatDate } from "@/lib/format";

export const revalidate = 3600;
export const metadata = {
  title: "Resources",
  description:
    "Publications, technical reports, policy briefs, toolkits, and research outputs generated across SAFE Africa's thematic areas.",
};

const TYPE_LABELS: Record<string, string> = {
  PUBLICATION: "Publication",
  REPORT: "Report",
  POLICY_BRIEF: "Policy brief",
  TOOLKIT: "Toolkit",
  RESEARCH: "Research paper",
};

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: { publishedAt: "desc" },
    include: { thematicArea: { select: { title: true } } },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="Knowledge"
        title="Resources"
        intro="Publications, technical reports, policy briefs, and practical toolkits supporting evidence-informed decision-making, digital agriculture, climate-smart agriculture, and capacity building."
      />
      {resources.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          Publications and reports will appear here as they are released. Check back soon.
        </p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <a
              key={resource.id}
              href={resource.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col rounded-xl border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary">{TYPE_LABELS[resource.type] ?? resource.type}</Badge>
                <span className="font-mono text-xs text-muted-foreground">{formatDate(resource.publishedAt)}</span>
              </div>
              <h2 className="font-display mt-3 font-semibold leading-snug group-hover:text-primary">
                {resource.title}
              </h2>
              {resource.description && (
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{resource.description}</p>
              )}
              <p className="mt-auto flex items-center gap-2 pt-4 text-sm font-medium text-primary">
                <FileDown className="h-4 w-4" /> Download
                {resource.thematicArea && (
                  <span className="ml-auto truncate text-xs font-normal text-muted-foreground">
                    {resource.thematicArea.title}
                  </span>
                )}
              </p>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
