import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/rich-text/content";
import { ApplicationForm } from "./application-form";
import { ArrowLeft } from "lucide-react";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const vacancies = await prisma.vacancy.findMany({ where: { status: "OPEN", deletedAt: null }, select: { slug: true } });
    return vacancies.map((vacancy) => ({ slug: vacancy.slug }));
  } catch {
    // DB unreachable at build time — generate pages on demand instead.
    return [];
  }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const vacancy = await prisma.vacancy.findUnique({ where: { slug } });
  return vacancy ? { title: `${vacancy.title} — Careers` } : {};
}

export default async function VacancyPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const vacancy = await prisma.vacancy.findUnique({ where: { slug } });
  if (!vacancy || vacancy.deletedAt) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/careers" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All vacancies
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-bold">{vacancy.title}</h1>
        <Badge variant={vacancy.status === "OPEN" ? "default" : "outline"}>
          {vacancy.status === "OPEN" ? "Open" : "Closed"}
        </Badge>
      </div>
      <p className="mt-2 text-muted-foreground">
        {vacancy.type === "JOB" ? "Job" : "Internship"} · {vacancy.location}
        {vacancy.deadline && <> · Apply by {formatDate(vacancy.deadline)}</>}
      </p>

      <RichTextContent html={vacancy.description} className="prose prose-neutral dark:prose-invert mt-8 max-w-none" />

      {vacancy.status === "OPEN" ? (
        <section className="mt-12 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h2 className="font-display text-xl font-semibold">Apply for this position</h2>
          <ApplicationForm vacancyId={vacancy.id} />
        </section>
      ) : (
        <p className="mt-12 rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          This vacancy is closed and no longer accepting applications.
        </p>
      )}
    </main>
  );
}
