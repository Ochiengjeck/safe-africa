import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { ArrowRight, Users } from "lucide-react";

export const revalidate = 3600;
export const metadata = {
  title: "Careers",
  description:
    "Join SAFE Africa's multidisciplinary team of professionals in agriculture, environment, social protection, and socio-economic research.",
};

export default async function CareersPage() {
  const [openings, past] = await Promise.all([
    prisma.vacancy.findMany({ where: { status: "OPEN", deletedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.vacancy.findMany({
      where: { status: "CLOSED", deletedAt: null },
      orderBy: { deadline: "desc" },
      take: 12,
      select: { id: true, slug: true, title: true, type: true, location: true, deadline: true },
    }),
  ]);

  return (
    <main>
      <PageHero
        eyebrow="Careers"
        title="Join our team"
        intro="Join SAFE Africa's multidisciplinary team of professionals in agriculture, environment, social protection, and socio-economic research. We welcome individuals committed to evidence generation, innovation, and inclusive development across Africa."
      />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
        {/* Current openings */}
        <section>
          <h2 className="font-display text-xl font-bold sm:text-2xl">Current openings</h2>
          {openings.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed p-10 text-center">
              <p className="font-display text-lg font-semibold">There are currently no open positions.</p>
              <p className="mt-2 text-muted-foreground">Join our talent pool below and we'll notify you when a matching role opens.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {openings.map((vacancy, i) => (
                <Reveal key={vacancy.id} delay={i * 60}>
                  <Link
                    href={`/careers/${vacancy.slug}`}
                    className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md sm:p-6"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-semibold group-hover:text-primary sm:text-lg">{vacancy.title}</h3>
                        <Badge variant="secondary">{vacancy.type === "JOB" ? "Job" : "Internship"}</Badge>
                      </div>
                      {vacancy.summary && <p className="mt-1 text-sm text-muted-foreground">{vacancy.summary}</p>}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {vacancy.location}
                        {vacancy.deadline && <> · Apply by {formatDate(vacancy.deadline)}</>}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      View &amp; apply <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </section>

        {/* Talent pool CTA */}
        <section className="mt-12 overflow-hidden rounded-2xl bg-sidebar text-sidebar-foreground">
          <div className="flex flex-wrap items-center justify-between gap-6 p-6 sm:p-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-brand-gold">
                <Users className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-widest">Talent pool</span>
              </div>
              <h2 className="font-display mt-2 text-xl font-bold sm:text-2xl">No matching role right now?</h2>
              <p className="mt-2 text-sm opacity-85">
                Register your profile in our talent pool. We'll notify you the moment a new opening matches your expertise —
                and you can be invited to interview directly.
              </p>
            </div>
            <Link
              href="/careers/talent-pool"
              className="inline-flex items-center gap-2 rounded-md bg-brand-orange-deep px-6 py-3 font-medium text-white shadow-md transition-opacity hover:opacity-90"
            >
              Join the talent pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Past openings */}
        {past.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-xl font-bold sm:text-2xl">Past openings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Recently closed positions, for reference.</p>
            <ul className="mt-5 divide-y rounded-xl border">
              {past.map((vacancy) => (
                <li key={vacancy.id}>
                  <Link href={`/careers/${vacancy.slug}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-secondary/40">
                    <div className="min-w-0">
                      <span className="font-medium">{vacancy.title}</span>
                      <span className="ml-2 text-sm text-muted-foreground">{vacancy.location}</span>
                    </div>
                    <span className="flex items-center gap-3">
                      {vacancy.deadline && <span className="font-mono text-xs text-muted-foreground">Closed {formatDate(vacancy.deadline)}</span>}
                      <Badge variant="outline">Closed</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
