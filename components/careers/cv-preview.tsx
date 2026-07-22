"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TalentPoolInput } from "@/lib/validation";

// Fixed palette — the CV renders on a white sheet in both light and dark mode,
// so it must not use theme tokens (which invert in dark mode and disappear).
const INK = "#1c231d";
const MUTED = "#5c6357";
const GREEN = "#1a5632";
const ORANGE = "#c2410c";
const BLUE = "#2a6bb5";

/**
 * Renders a talent-pool profile as a formatted, print-friendly CV. Export is
 * browser print-to-PDF (the toolbar is hidden when printing via `print:hidden`).
 */
export function CvPreview({ data, showToolbar = true }: { data: Partial<TalentPoolInput>; showToolbar?: boolean }) {
  return (
    <div className="space-y-6">
      {showToolbar && (
        <div className="flex justify-end print:hidden">
          <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print / Save as PDF
          </Button>
        </div>
      )}

      <article className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm print:border-0 print:shadow-none" style={{ color: INK }}>
        <header className="border-b pb-4" style={{ borderColor: "#e2e6da" }}>
          <h1 className="font-display text-2xl font-bold">{data.fullName}</h1>
          {data.professionalTitle && <p className="mt-1 font-medium" style={{ color: ORANGE }}>{data.professionalTitle}</p>}
          <p className="mt-2 text-sm" style={{ color: MUTED }}>
            {[data.location, data.nationality].filter(Boolean).join(" · ")}
          </p>
          <p className="text-sm" style={{ color: MUTED }}>
            {[data.primaryEmail, data.primaryPhone].filter(Boolean).join(" · ")}
          </p>
          {data.linkedinUrl && (
            <p className="text-sm">
              <a href={data.linkedinUrl} className="underline" style={{ color: BLUE }} target="_blank" rel="noreferrer">
                {data.linkedinUrl}
              </a>
            </p>
          )}
        </header>

        {data.profileSummary && (
          <Section title="Profile">
            <p className="text-sm leading-relaxed">{data.profileSummary}</p>
            {data.careerObjective && <p className="mt-2 text-sm leading-relaxed">{data.careerObjective}</p>}
          </Section>
        )}

        {Boolean(data.primarySpecializations?.length || data.technicalSkills?.length) && (
          <Section title="Skills & specializations">
            {data.primarySpecializations && data.primarySpecializations.length > 0 && (
              <p className="text-sm"><strong>Specializations:</strong> {data.primarySpecializations.join(", ")}</p>
            )}
            {data.technicalSkills && data.technicalSkills.length > 0 && (
              <p className="mt-1 text-sm"><strong>Technical skills:</strong> {data.technicalSkills.join(", ")}</p>
            )}
            {data.researchInterests && <p className="mt-1 text-sm"><strong>Research interests:</strong> {data.researchInterests}</p>}
          </Section>
        )}

        {data.employmentHistory && data.employmentHistory.length > 0 && (
          <Section title="Employment history">
            {data.employmentHistory.map((job, i) => (
              <Entry key={i} heading={`${job.position} — ${job.employer}`} meta={[`${job.startDate} – ${job.endDate}`, job.location].filter(Boolean).join(" · ")}>
                {job.responsibilities && <p className="text-sm">{job.responsibilities}</p>}
              </Entry>
            ))}
          </Section>
        )}

        {data.education && data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((ed, i) => (
              <Entry key={i} heading={`${ed.qualification} — ${ed.institution}`} meta={`${ed.startYear} – ${ed.endYear}`}>
                {ed.description && <p className="text-sm">{ed.description}</p>}
              </Entry>
            ))}
          </Section>
        )}

        {data.projects && data.projects.length > 0 && (
          <Section title="Projects & assignments">
            {data.projects.map((p, i) => (
              <Entry key={i} heading={p.projectTitle} meta={[p.year, p.client, p.role].filter(Boolean).join(" · ")}>
                {p.summary && <p className="text-sm">{p.summary}</p>}
              </Entry>
            ))}
          </Section>
        )}

        {data.memberships && data.memberships.length > 0 && (
          <Section title="Memberships & registrations">
            {data.memberships.map((m, i) => (
              <p key={i} className="text-sm">
                {m.organization}
                {m.membershipType ? ` — ${m.membershipType}` : ""}
                {m.registrationNumber ? ` (${m.registrationNumber})` : ""}
              </p>
            ))}
          </Section>
        )}

        {data.researchAndPublications && data.researchAndPublications.length > 0 && (
          <Section title="Research & publications">
            {data.researchAndPublications.map((r, i) => (
              <Entry key={i} heading={r.title} meta={r.partners}>
                {r.abstractOrRole && <p className="text-sm">{r.abstractOrRole}</p>}
                {r.link && <a href={r.link} className="text-sm underline" style={{ color: BLUE }} target="_blank" rel="noreferrer">{r.link}</a>}
              </Entry>
            ))}
          </Section>
        )}

        {data.references && data.references.length > 0 && (
          <Section title="References">
            {data.references.map((ref, i) => (
              <p key={i} className="text-sm">
                <strong>{ref.name}</strong>
                {ref.position ? `, ${ref.position}` : ""}
                {ref.organization ? `, ${ref.organization}` : ""}
                {(ref.email || ref.phone) ? ` — ${[ref.email, ref.phone].filter(Boolean).join(", ")}` : ""}
              </p>
            ))}
          </Section>
        )}

        {data.digitalSignature && (
          <Section title="Declaration">
            <p className="text-sm">I confirm the information provided is accurate.</p>
            <p className="mt-2 text-sm">Signed: <strong>{data.digitalSignature}</strong> · {data.dateSigned}</p>
          </Section>
        )}
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="font-display text-sm font-bold uppercase tracking-wide" style={{ color: GREEN }}>{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function Entry({ heading, meta, children }: { heading: string; meta?: string; children?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold">{heading}</p>
      {meta && <p className="font-mono text-xs" style={{ color: MUTED }}>{meta}</p>}
      {children && <div className="mt-1">{children}</div>}
    </div>
  );
}
