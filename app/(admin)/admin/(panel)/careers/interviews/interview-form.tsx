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

export function InterviewForm({
  initial,
  vacancies,
}: {
  initial?: InterviewInitial;
  vacancies: { id: string; title: string }[];
}) {
  const [state, action] = useActionState(scheduleInterview, null);
  const [vacancyId, setVacancyId] = useState(initial?.vacancyId ?? "");

  return (
    <form action={action} className="max-w-2xl space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {initial?.applicationId && <input type="hidden" name="applicationId" value={initial.applicationId} />}
      {initial?.talentPoolId && <input type="hidden" name="talentPoolId" value={initial.talentPoolId} />}
      <FormError state={state} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Candidate name" name="candidateName" state={state}>
          <Input id="candidateName" name="candidateName" defaultValue={initial?.candidateName} required />
        </Field>
        <Field label="Candidate email" name="candidateEmail" state={state}>
          <Input id="candidateEmail" name="candidateEmail" type="email" defaultValue={initial?.candidateEmail} required />
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
        <Input
          id="positionTitle"
          name="positionTitle"
          defaultValue={initial?.positionTitle}
          required
          placeholder="e.g. Field Enumerator, or a general role"
        />
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
