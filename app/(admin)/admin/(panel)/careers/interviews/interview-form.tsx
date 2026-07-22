"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { scheduleInterview } from "@/lib/actions/interviews";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export type InterviewInitial = {
  id?: string;
  applicationId?: string | null;
  talentPoolId?: string | null;
  vacancyId?: string | null;
  positionTitle?: string;
  candidateName?: string;
  candidateEmail?: string;
  scheduledAt?: string; // yyyy-MM-ddTHH:mm
  mode?: "VIDEO" | "PHONE" | "IN_PERSON";
  locationOrLink?: string | null;
  notes?: string | null;
};

export type ApplicantOption = { id: string; name: string; email: string; vacancyId: string; vacancyTitle: string };
export type TalentOption = { id: string; name: string; email: string; title: string };

type Source = "manual" | "applicant" | "talent";

export function InterviewForm({
  initial,
  vacancies,
  applicants = [],
  talent = [],
}: {
  initial?: InterviewInitial;
  vacancies: { id: string; title: string }[];
  applicants?: ApplicantOption[];
  talent?: TalentOption[];
}) {
  const [state, action] = useActionState(scheduleInterview, null);

  const [source, setSource] = useState<Source>(
    initial?.applicationId ? "applicant" : initial?.talentPoolId ? "talent" : "manual"
  );
  const [applicationId, setApplicationId] = useState(initial?.applicationId ?? "");
  const [talentPoolId, setTalentPoolId] = useState(initial?.talentPoolId ?? "");
  const [vacancyId, setVacancyId] = useState(initial?.vacancyId ?? "");
  const [candidateName, setCandidateName] = useState(initial?.candidateName ?? "");
  const [candidateEmail, setCandidateEmail] = useState(initial?.candidateEmail ?? "");
  const [positionTitle, setPositionTitle] = useState(initial?.positionTitle ?? "");

  const isEditing = Boolean(initial?.id);

  function changeSource(next: Source) {
    setSource(next);
    setApplicationId("");
    setTalentPoolId("");
    if (next === "manual") {
      setCandidateName("");
      setCandidateEmail("");
      setPositionTitle("");
    }
  }

  function pickApplicant(id: string) {
    setApplicationId(id);
    const a = applicants.find((x) => x.id === id);
    if (a) {
      setCandidateName(a.name);
      setCandidateEmail(a.email);
      setVacancyId(a.vacancyId);
      setPositionTitle(a.vacancyTitle);
    }
  }

  function pickTalent(id: string) {
    setTalentPoolId(id);
    const t = talent.find((x) => x.id === id);
    if (t) {
      setCandidateName(t.name);
      setCandidateEmail(t.email);
      setPositionTitle(t.title);
    }
  }

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="talentPoolId" value={talentPoolId} />
      <FormError state={state} />

      {!isEditing && (applicants.length > 0 || talent.length > 0) && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Who are you interviewing?</p>
          <div className="flex flex-wrap gap-2">
            {(["applicant", "talent", "manual"] as Source[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => changeSource(s)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  source === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                }`}
              >
                {s === "applicant" ? "An applicant" : s === "talent" ? "Talent pool candidate" : "Enter manually"}
              </button>
            ))}
          </div>

          {source === "applicant" && (
            <select value={applicationId} onChange={(e) => pickApplicant(e.target.value)} className={SELECT_CLASS}>
              <option value="">Select an applicant…</option>
              {applicants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.vacancyTitle}
                </option>
              ))}
            </select>
          )}
          {source === "talent" && (
            <select value={talentPoolId} onChange={(e) => pickTalent(e.target.value)} className={SELECT_CLASS}>
              <option value="">Select a talent pool candidate…</option>
              {talent.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Candidate name" name="candidateName" state={state}>
          <Input id="candidateName" name="candidateName" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
        </Field>
        <Field label="Candidate email" name="candidateEmail" state={state}>
          <Input id="candidateEmail" name="candidateEmail" type="email" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
        </Field>
      </div>

      <Field label="Open vacancy (optional)" name="vacancyId" state={state}>
        <select id="vacancyId" name="vacancyId" value={vacancyId} onChange={(e) => setVacancyId(e.target.value)} className={SELECT_CLASS}>
          <option value="">Not linked to an open vacancy</option>
          {vacancies.map((v) => (
            <option key={v.id} value={v.id}>{v.title}</option>
          ))}
        </select>
      </Field>

      <Field label="Position / role" name="positionTitle" state={state}>
        <Input id="positionTitle" name="positionTitle" value={positionTitle} onChange={(e) => setPositionTitle(e.target.value)} required placeholder="e.g. Field Enumerator, or a general role" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date & time" name="scheduledAt" state={state}>
          <Input id="scheduledAt" name="scheduledAt" type="datetime-local" defaultValue={initial?.scheduledAt} required />
        </Field>
        <Field label="Format" name="mode" state={state}>
          <select id="mode" name="mode" defaultValue={initial?.mode ?? "VIDEO"} className={SELECT_CLASS}>
            <option value="VIDEO">Video call</option>
            <option value="PHONE">Phone call</option>
            <option value="IN_PERSON">In person</option>
          </select>
        </Field>
      </div>

      <Field label="Location or meeting link" name="locationOrLink" state={state}>
        <Input id="locationOrLink" name="locationOrLink" defaultValue={initial?.locationOrLink ?? ""} placeholder="Office address or video link" />
      </Field>

      <Field label="Notes for the candidate (optional)" name="notes" state={state}>
        <Textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ""} placeholder="Anything the candidate should prepare or bring" />
      </Field>

      <div className="flex items-center gap-3">
        <SubmitButton>{initial?.id ? "Save changes" : "Schedule interview"}</SubmitButton>
        <Link href="/admin/careers/interviews" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
