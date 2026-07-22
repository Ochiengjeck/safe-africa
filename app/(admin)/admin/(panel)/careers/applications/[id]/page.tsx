import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApplicationActions } from "../application-actions";
import { defaultApplicationFields, type FormField } from "@/lib/careers/form-fields";

export const metadata = { title: "Application — SAFE Africa CMS" };

function answerText(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export default async function ApplicationDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const app = await prisma.application.findFirst({
    where: { id, deletedAt: null },
    include: { vacancy: { select: { title: true, slug: true, form: { select: { fields: true } } } } },
  });
  if (!app) notFound();

  const fields = (app.vacancy.form?.fields as FormField[] | undefined) ?? defaultApplicationFields();
  const answers = (app.answers as Record<string, unknown> | null) ?? {};
  const answered = fields.filter((f) => f.type !== "section" && f.type !== "file" && f.id in answers);

  const cvUrl = app.cvUrl;
  const isPdf = cvUrl ? /\.pdf(\?|$)/i.test(cvUrl) : false;
  const viewerSrc = cvUrl
    ? isPdf
      ? cvUrl
      : `https://docs.google.com/gview?url=${encodeURIComponent(cvUrl)}&embedded=true`
    : null;

  return (
    <div className="space-y-6">
      <Link href="/admin/careers/applications" className="text-sm font-medium text-primary hover:underline">
        ← All applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold">{app.name}</h1>
            <Badge variant={app.status === "NEW" ? "default" : "secondary"}>{app.status.toLowerCase()}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Applied for <strong className="text-foreground">{app.vacancy.title}</strong> · {formatDate(app.createdAt)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <a href={`mailto:${app.email}`} className="text-primary hover:underline">{app.email}</a> · {app.phone}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4">
        <ApplicationActions id={app.id} status={app.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Answers */}
        <section>
          <h2 className="font-display text-lg font-semibold">Application responses</h2>
          <dl className="mt-4 space-y-4">
            {answered.length === 0 && app.coverLetter && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cover letter</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">{app.coverLetter}</dd>
              </div>
            )}
            {answered.map((f) => (
              <div key={f.id}>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{f.label}</dt>
                <dd className="mt-0.5 whitespace-pre-wrap text-sm">{answerText(answers[f.id])}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* CV */}
        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">CV / resume</h2>
            {cvUrl && (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={cvUrl} target="_blank" rel="noreferrer">Open</a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <a href={cvUrl} download>Download</a>
                </Button>
              </div>
            )}
          </div>
          {cvUrl ? (
            <iframe
              src={viewerSrc ?? undefined}
              title={`CV of ${app.name}`}
              className="mt-4 h-[600px] w-full rounded-lg border bg-white"
            />
          ) : (
            <p className="mt-4 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No CV was attached to this application.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
