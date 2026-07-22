import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { RichTextContent } from "@/components/rich-text/content";
import { ApplicationForm } from "./application-form";
import { defaultApplicationFields, type FormField } from "@/lib/careers/form-fields";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const vacancy = await prisma.vacancy.findUnique({ where: { slug }, include: { form: true } });
  // DRAFT vacancies are not public.
  if (!vacancy || vacancy.deletedAt || vacancy.status === "DRAFT") notFound();

  const fields = (vacancy.form?.fields as FormField[] | undefined) ?? defaultApplicationFields();
  const requireCv = vacancy.form?.requireCv ?? true;
  const resumeStrict = vacancy.resumeStrict || (vacancy.form?.resumeStrict ?? false);
  const resumeTemplateUrl = vacancy.resumeTemplateUrl || vacancy.form?.resumeTemplateUrl;

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:py-16">
      <Link href="/careers" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" /> All vacancies
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{vacancy.title}</h1>
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
          <ApplicationForm
            vacancyId={vacancy.id}
            fields={fields}
            requireCv={requireCv}
            resumeStrict={resumeStrict}
            resumeTemplateUrl={resumeTemplateUrl}
          />
        </section>
      ) : (
        <div className="mt-12 rounded-xl border border-dashed p-8 text-center">
          <p className="text-muted-foreground">This vacancy is closed and no longer accepting applications.</p>
          <Link href="/careers/talent-pool" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Join our talent pool to hear about future openings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </main>
  );
}
