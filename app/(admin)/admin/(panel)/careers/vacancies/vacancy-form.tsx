"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveVacancy } from "@/lib/actions/careers";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/rich-text/editor";
import { FormBuilder } from "@/components/careers/form-builder";
import type { Vacancy } from "@/lib/generated/prisma/client";

const SELECT_CLASS = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export function VacancyForm({ vacancy, forms }: { vacancy?: Vacancy; forms: { id: string; name: string }[] }) {
  const [state, action] = useActionState(saveVacancy, null);
  const [formId, setFormId] = useState(vacancy?.formId ?? "");
  const [resumeStrict, setResumeStrict] = useState(vacancy?.resumeStrict ?? false);

  return (
    <form action={action} className="max-w-3xl space-y-5">
      {vacancy && <input type="hidden" name="id" value={vacancy.id} />}
      <FormError state={state} />

      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={vacancy?.title} required />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Type" name="type" state={state}>
          <select id="type" name="type" defaultValue={vacancy?.type ?? "JOB"} className={SELECT_CLASS}>
            <option value="JOB">Job</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </Field>
        <Field label="Location" name="location" state={state}>
          <Input id="location" name="location" defaultValue={vacancy?.location} required />
        </Field>
        <Field label="Deadline" name="deadline" state={state}>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={vacancy?.deadline ? vacancy.deadline.toISOString().slice(0, 10) : ""}
          />
        </Field>
      </div>

      <Field label="Summary (shown on cards)" name="summary" state={state}>
        <Input id="summary" name="summary" defaultValue={vacancy?.summary ?? ""} placeholder="One-line teaser" />
      </Field>

      <Field label="Description" name="description" state={state}>
        <RichTextEditor name="description" defaultValue={vacancy?.description} />
      </Field>

      <Field label="Status" name="status" state={state}>
        <select id="status" name="status" defaultValue={vacancy?.status ?? "DRAFT"} className="h-9 w-full max-w-48 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="DRAFT">Draft</option>
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </Field>

      {/* Application form selection */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <Field label="Application form" name="formId" state={state}>
          <select id="formId" name="formId" value={formId} onChange={(e) => setFormId(e.target.value)} className={SELECT_CLASS}>
            <option value="">Default (standard application form)</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
            <option value="__custom__">➕ Build a custom form for this vacancy…</option>
          </select>
        </Field>

        {formId === "__custom__" && (
          <div className="space-y-3">
            <Field label="Custom form name" name="customFormName" state={state}>
              <Input id="customFormName" name="customFormName" placeholder={`${vacancy?.title ?? "This role"} — application form`} />
            </Field>
            <FormBuilder name="customFields" />
          </div>
        )}
      </div>

      {/* Resume format */}
      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="resumeStrict"
            checked={resumeStrict}
            onChange={(e) => setResumeStrict(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Require a <strong>strict resume format</strong> for this vacancy
        </label>
        {resumeStrict && (
          <Field label="Resume template URL" name="resumeTemplateUrl" state={state}>
            <Input
              id="resumeTemplateUrl"
              name="resumeTemplateUrl"
              type="url"
              defaultValue={vacancy?.resumeTemplateUrl ?? ""}
              placeholder="https://docs.google.com/document/…"
            />
          </Field>
        )}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>{vacancy ? "Save changes" : "Create vacancy"}</SubmitButton>
        <Link href="/admin/careers/vacancies" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
