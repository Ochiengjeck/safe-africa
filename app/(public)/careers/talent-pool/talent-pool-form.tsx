"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Repeatable } from "@/components/careers/repeatable";
import { CvPreview } from "@/components/careers/cv-preview";
import { submitTalentPool } from "@/lib/actions/public";
import type { TalentPoolInput } from "@/lib/validation";

const DRAFT_KEY = "safe-africa-talent-draft";
const RETENTION = ["6 months", "1 year", "2 years", "Indefinite"] as const;

type Education = { institution: string; qualification: string; startYear: string; endYear: string; description: string };
type Employment = { startDate: string; endDate: string; employer: string; position: string; location: string; responsibilities: string; reference: { name: string; role: string; email: string; phone: string } };
type Project = { year: string; client: string; role: string; projectTitle: string; summary: string; reference: { name: string; email: string; phone: string } };
type Membership = { organization: string; membershipType: string; registrationNumber: string; startDate: string };
type Publication = { title: string; partners: string; abstractOrRole: string; link: string };
type Reference = { name: string; position: string; organization: string; phone: string; email: string; relationship: string };

type FormState = {
  fullName: string; preferredName: string; nationality: string; location: string;
  primaryPhone: string; otherPhonesRaw: string; primaryEmail: string; otherEmailsRaw: string; linkedinUrl: string;
  professionalTitle: string; profileSummary: string; careerObjective: string;
  specializationsRaw: string; technicalSkillsRaw: string; researchInterests: string;
  education: Education[]; employmentHistory: Employment[]; projects: Project[];
  memberships: Membership[]; researchAndPublications: Publication[]; references: Reference[];
  digitalSignature: string; dateSigned: string; declarationSigned: boolean; privacyConsent: boolean;
  dataRetentionPeriod: (typeof RETENTION)[number];
};

const blankEducation = (): Education => ({ institution: "", qualification: "", startYear: "", endYear: "", description: "" });
const blankEmployment = (): Employment => ({ startDate: "", endDate: "", employer: "", position: "", location: "", responsibilities: "", reference: { name: "", role: "", email: "", phone: "" } });
const blankProject = (): Project => ({ year: "", client: "", role: "", projectTitle: "", summary: "", reference: { name: "", email: "", phone: "" } });
const blankMembership = (): Membership => ({ organization: "", membershipType: "", registrationNumber: "", startDate: "" });
const blankPublication = (): Publication => ({ title: "", partners: "", abstractOrRole: "", link: "" });
const blankReference = (): Reference => ({ name: "", position: "", organization: "", phone: "", email: "", relationship: "" });

const initialState: FormState = {
  fullName: "", preferredName: "", nationality: "", location: "",
  primaryPhone: "", otherPhonesRaw: "", primaryEmail: "", otherEmailsRaw: "", linkedinUrl: "",
  professionalTitle: "", profileSummary: "", careerObjective: "",
  specializationsRaw: "", technicalSkillsRaw: "", researchInterests: "",
  education: [blankEducation()], employmentHistory: [blankEmployment()], projects: [],
  memberships: [], researchAndPublications: [], references: [blankReference()],
  digitalSignature: "", dateSigned: new Date().toISOString().slice(0, 10), declarationSigned: false, privacyConsent: false,
  dataRetentionPeriod: "1 year",
};

const toList = (raw: string) => raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

function buildData(f: FormState): TalentPoolInput {
  return {
    fullName: f.fullName, preferredName: f.preferredName || undefined, nationality: f.nationality, location: f.location,
    primaryPhone: f.primaryPhone, otherPhones: toList(f.otherPhonesRaw), primaryEmail: f.primaryEmail, otherEmails: toList(f.otherEmailsRaw),
    linkedinUrl: f.linkedinUrl || undefined,
    professionalTitle: f.professionalTitle, profileSummary: f.profileSummary, careerObjective: f.careerObjective || undefined,
    primarySpecializations: toList(f.specializationsRaw), technicalSkills: toList(f.technicalSkillsRaw), researchInterests: f.researchInterests || undefined,
    education: f.education, memberships: f.memberships, employmentHistory: f.employmentHistory, projects: f.projects,
    researchAndPublications: f.researchAndPublications, references: f.references,
    digitalSignature: f.digitalSignature, dateSigned: f.dateSigned,
    declarationSigned: true, privacyConsent: true, dataRetentionPeriod: f.dataRetentionPeriod,
  } as TalentPoolInput;
}

export function TalentPoolForm() {
  const [f, setF] = useState<FormState>(initialState);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string; issues?: string[] } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Load draft once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) setF({ ...initialState, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  // Persist draft.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
    } catch {}
  }, [f, hydrated]);

  const set = (patch: Partial<FormState>) => setF((prev) => ({ ...prev, ...patch }));

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.declarationSigned || !f.privacyConsent) {
      setResult({ ok: false, error: "Please confirm the declaration and consent at the bottom of the form." });
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    const payload = { ...buildData(f), website: "" };
    startTransition(async () => {
      const res = await submitTalentPool(payload);
      setResult(res.ok ? { ok: true } : { ok: false, error: res.error, issues: "issues" in res ? res.issues : undefined });
      if (res.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {}
      }
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (result?.ok) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h2 className="font-display text-2xl font-bold text-primary">You're in the talent pool 🎉</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Thank you for joining. We'll email you at <strong>{f.primaryEmail}</strong> whenever a new opening matches your
          profile. You can update your details anytime by submitting this form again with the same email.
        </p>
      </div>
    );
  }

  return (
    <div ref={topRef}>
      {result?.error && (
        <div role="alert" className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">{result.error}</p>
          {result.issues && result.issues.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-5">
              {result.issues.slice(0, 8).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {showPreview ? (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="font-display text-xl font-semibold">Preview</h2>
            <Button variant="outline" onClick={() => setShowPreview(false)}>Back to editing</Button>
          </div>
          <CvPreview data={buildData(f)} showToolbar={false} />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-10">
          {/* Honeypot */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden value="" onChange={() => {}} />

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Personal & contact details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Full name" required value={f.fullName} onChange={(v) => set({ fullName: v })} />
              <Text label="Preferred name" value={f.preferredName} onChange={(v) => set({ preferredName: v })} />
              <Text label="Nationality" required value={f.nationality} onChange={(v) => set({ nationality: v })} />
              <Text label="County / City" required value={f.location} onChange={(v) => set({ location: v })} />
              <Text label="Primary phone" required type="tel" value={f.primaryPhone} onChange={(v) => set({ primaryPhone: v })} hint="Include country code, e.g. +254…" />
              <Text label="Other phones" value={f.otherPhonesRaw} onChange={(v) => set({ otherPhonesRaw: v })} hint="Comma-separated" />
              <Text label="Primary email" required type="email" value={f.primaryEmail} onChange={(v) => set({ primaryEmail: v })} />
              <Text label="Other emails" value={f.otherEmailsRaw} onChange={(v) => set({ otherEmailsRaw: v })} hint="Comma-separated" />
              <Text label="LinkedIn / website" type="url" value={f.linkedinUrl} onChange={(v) => set({ linkedinUrl: v })} />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Professional summary</h2>
            <Text label="Professional title / specialization" required value={f.professionalTitle} onChange={(v) => set({ professionalTitle: v })} />
            <Area label="Short profile summary" required value={f.profileSummary} onChange={(v) => set({ profileSummary: v })} hint="1–3 sentences summarizing your experience and focus." />
            <Area label="Career objective" value={f.careerObjective} onChange={(v) => set({ careerObjective: v })} />
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold">Skills & specializations</h2>
            <Text label="Primary specializations" required value={f.specializationsRaw} onChange={(v) => set({ specializationsRaw: v })} hint="Comma-separated, e.g. Impact Evaluation, Survey Design" />
            <Text label="Technical skills" value={f.technicalSkillsRaw} onChange={(v) => set({ technicalSkillsRaw: v })} hint="Comma-separated, e.g. STATA, ODK, R" />
            <Area label="Research interests / focus areas" value={f.researchInterests} onChange={(v) => set({ researchInterests: v })} />
          </section>

          <Repeatable
            legend="Employment history"
            hint="Most recent first."
            items={f.employmentHistory}
            blank={blankEmployment}
            onChange={(employmentHistory) => set({ employmentHistory })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Position" required value={item.position} onChange={(v) => update({ position: v })} />
                <Text label="Employer" required value={item.employer} onChange={(v) => update({ employer: v })} />
                <Text label="Start (year/month)" required value={item.startDate} onChange={(v) => update({ startDate: v })} />
                <Text label="End (year/month or 'Present')" required value={item.endDate} onChange={(v) => update({ endDate: v })} />
                <Text label="Location" value={item.location} onChange={(v) => update({ location: v })} />
                <div className="sm:col-span-2">
                  <Area label="Responsibilities & achievements" required value={item.responsibilities} onChange={(v) => update({ responsibilities: v })} />
                </div>
              </div>
            )}
          />

          <Repeatable
            legend="Education & certificates"
            items={f.education}
            blank={blankEducation}
            onChange={(education) => set({ education })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Institution" required value={item.institution} onChange={(v) => update({ institution: v })} />
                <Text label="Qualification" required value={item.qualification} onChange={(v) => update({ qualification: v })} />
                <Text label="Start year" required value={item.startYear} onChange={(v) => update({ startYear: v })} hint="YYYY" />
                <Text label="End year" required value={item.endYear} onChange={(v) => update({ endYear: v })} hint="YYYY" />
                <div className="sm:col-span-2">
                  <Area label="Description / major subjects" value={item.description} onChange={(v) => update({ description: v })} />
                </div>
              </div>
            )}
          />

          <Repeatable
            legend="Projects & assignments"
            items={f.projects}
            blank={blankProject}
            onChange={(projects) => set({ projects })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Project title" required value={item.projectTitle} onChange={(v) => update({ projectTitle: v })} />
                <Text label="Year" required value={item.year} onChange={(v) => update({ year: v })} hint="YYYY" />
                <Text label="Client / employer" required value={item.client} onChange={(v) => update({ client: v })} />
                <Text label="Your role" required value={item.role} onChange={(v) => update({ role: v })} />
                <div className="sm:col-span-2">
                  <Area label="Summary of activities / deliverables" required value={item.summary} onChange={(v) => update({ summary: v })} />
                </div>
              </div>
            )}
          />

          <Repeatable
            legend="Professional memberships"
            items={f.memberships}
            blank={blankMembership}
            onChange={(memberships) => set({ memberships })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Organization" required value={item.organization} onChange={(v) => update({ organization: v })} />
                <Text label="Membership type" value={item.membershipType} onChange={(v) => update({ membershipType: v })} />
                <Text label="Registration number" value={item.registrationNumber} onChange={(v) => update({ registrationNumber: v })} />
                <Text label="Start date" value={item.startDate} onChange={(v) => update({ startDate: v })} />
              </div>
            )}
          />

          <Repeatable
            legend="Research & publications"
            items={f.researchAndPublications}
            blank={blankPublication}
            onChange={(researchAndPublications) => set({ researchAndPublications })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Title" required value={item.title} onChange={(v) => update({ title: v })} />
                <Text label="Partners / collaborators" value={item.partners} onChange={(v) => update({ partners: v })} />
                <div className="sm:col-span-2">
                  <Area label="Short abstract / your role" value={item.abstractOrRole} onChange={(v) => update({ abstractOrRole: v })} />
                </div>
                <Text label="Link / DOI" type="url" value={item.link} onChange={(v) => update({ link: v })} />
              </div>
            )}
          />

          <Repeatable
            legend="References"
            items={f.references}
            blank={blankReference}
            onChange={(references) => set({ references })}
            render={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Text label="Name" required value={item.name} onChange={(v) => update({ name: v })} />
                <Text label="Position" value={item.position} onChange={(v) => update({ position: v })} />
                <Text label="Organization" value={item.organization} onChange={(v) => update({ organization: v })} />
                <Text label="Relationship" value={item.relationship} onChange={(v) => update({ relationship: v })} />
                <Text label="Email" type="email" value={item.email} onChange={(v) => update({ email: v })} />
                <Text label="Phone" type="tel" value={item.phone} onChange={(v) => update({ phone: v })} />
              </div>
            )}
          />

          <section className="space-y-4 rounded-xl border bg-muted/30 p-5">
            <h2 className="font-display text-lg font-semibold">Declaration & consent</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Text label="Digital signature (type your full name)" required value={f.digitalSignature} onChange={(v) => set({ digitalSignature: v })} />
              <Text label="Date" required type="date" value={f.dateSigned} onChange={(v) => set({ dateSigned: v })} />
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={f.declarationSigned} onChange={(e) => set({ declarationSigned: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-input" />
              I confirm that the information provided is accurate and complete.
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" checked={f.privacyConsent} onChange={(e) => set({ privacyConsent: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-input" />
              I consent to SAFE Africa storing my data to generate a CV and to contact me about relevant opportunities.
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Data retention preference
              <select
                value={f.dataRetentionPeriod}
                onChange={(e) => set({ dataRetentionPeriod: e.target.value as FormState["dataRetentionPeriod"] })}
                className="h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 text-sm"
              >
                {RETENTION.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t pt-6">
            <Button type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Join the talent pool"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
              Preview my CV
            </Button>
            <span className="text-xs text-muted-foreground">Your progress is saved automatically on this device.</span>
          </div>
        </form>
      )}
    </div>
  );
}

function Text({
  label, value, onChange, required, type = "text", hint,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string; hint?: string;
}) {
  return (
    <label className="block space-y-1 text-sm font-medium">
      <span>
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Area({
  label, value, onChange, required, hint,
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; hint?: string;
}) {
  return (
    <label className="block space-y-1 text-sm font-medium">
      <span>
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
