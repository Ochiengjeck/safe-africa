import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export const revalidate = 3600;
export const metadata = {
  title: "Careers",
  description:
    "Join SAFE Africa's multidisciplinary team of professionals in agriculture, environment, social protection, and socio-economic research.",
};

export default async function CareersPage() {
  const vacancies = await prisma.vacancy.findMany({
    where: { status: "OPEN", deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <PageHero
        eyebrow="Careers"
        title="Join our team"
        intro="Join SAFE Africa's multidisciplinary team of professionals in agriculture, environment, social protection, and socio-economic research. We welcome individuals committed to evidence generation, innovation, and inclusive development across Africa."
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
      {vacancies.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="font-display text-lg font-semibold">There are currently no open positions.</p>
          <p className="mt-2 text-muted-foreground">Please check back for future opportunities.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {vacancies.map((vacancy, i) => (
            <Reveal key={vacancy.id} delay={i * 60}>
            <Link
              href={`/careers/${vacancy.slug}`}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold group-hover:text-primary">{vacancy.title}</h2>
                  <Badge variant="secondary">{vacancy.type === "JOB" ? "Job" : "Internship"}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {vacancy.location}
                  {vacancy.deadline && <> · Apply by {formatDate(vacancy.deadline)}</>}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                View & apply <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            </Reveal>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}
