import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/content";
import { SectionHeading } from "@/components/site/section-heading";
import { MapPin, Compass } from "lucide-react";

export const revalidate = 3600;
export const metadata = {
  title: "About Us",
  description:
    "SAFE Africa is a Kenya-registered research and consultancy firm supporting governments, development partners, NGOs, and private sector actors with evidence generation, evaluation, and advisory services.",
};

type Overview = { paragraphs: string[] };
type Mission = { mission: string; vision: string };
type Values = { values: { name: string; description: string }[] };
type Footprint = { headquarters: string; operations: string };
type Approach = { body: string };

export default async function AboutPage() {
  const [overview, mission, values, footprint, approach, team] = await Promise.all([
    getSection<Overview>("about.overview", { paragraphs: [] }),
    getSection<Mission>("about.mission", { mission: "", vision: "" }),
    getSection<Values>("about.values", { values: [] }),
    getSection<Footprint>("about.footprint", { headquarters: "", operations: "" }),
    getSection<Approach>("about.approach", { body: "" }),
    prisma.teamMember.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeading
        eyebrow="About us"
        title="Evidence with roots in Africa"
        intro="Smart Agriculture and Food Economics Africa Ltd (SAFE Africa Ltd)"
      />

      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-3xl">
        {overview.paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {/* Mission & vision */}
      <div className="mt-14 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl bg-primary p-8 text-primary-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-75">Mission</p>
          <p className="font-display mt-3 text-xl font-semibold leading-snug">{mission.mission}</p>
        </div>
        <div className="rounded-xl bg-sidebar p-8 text-sidebar-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-75">Vision</p>
          <p className="font-display mt-3 text-xl font-semibold leading-snug">{mission.vision}</p>
        </div>
      </div>

      {/* Values */}
      {values.values.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Values & principles" title="What guides our work" />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {values.values.map((value) => (
              <div key={value.name} className="rounded-xl border-t-4 border-brand-leaf bg-card p-5 shadow-sm">
                <h3 className="font-display font-semibold">{value.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footprint & approach */}
      <section className="mt-20 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <MapPin className="h-6 w-6 text-brand-orange" aria-hidden="true" />
          <h3 className="font-display mt-3 text-lg font-semibold">Geographic footprint</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Headquarters:</strong> {footprint.headquarters}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong className="text-foreground">Operations:</strong> {footprint.operations}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <Compass className="h-6 w-6 text-brand-blue" aria-hidden="true" />
          <h3 className="font-display mt-3 text-lg font-semibold">Our approach</h3>
          <p className="mt-3 text-sm text-muted-foreground">{approach.body}</p>
        </div>
      </section>

      {/* Team */}
      {team.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Our team" title="Multidisciplinary experts" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.id} className="rounded-xl border bg-card p-5 text-center shadow-sm">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-secondary font-display text-2xl font-bold text-secondary-foreground">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="font-display mt-4 font-semibold">{member.name}</h3>
                <p className="text-sm text-brand-orange">{member.title}</p>
                {member.bio && <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
