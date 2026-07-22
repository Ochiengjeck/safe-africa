"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveApplicationForm } from "@/lib/actions/application-forms";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { FormBuilder } from "@/components/careers/form-builder";
import type { FormField } from "@/lib/careers/form-fields";

type FormRecord = {
  id: string;
  name: string;
  description: string | null;
  fields: FormField[];
  isTemplate: boolean;
  requireCv: boolean;
  resumeStrict: boolean;
  resumeTemplateUrl: string | null;
};

export function FormEditor({ form, initialFields }: { form?: FormRecord; initialFields?: FormField[] }) {
  const [state, action] = useActionState(saveApplicationForm, null);
  const [resumeStrict, setResumeStrict] = useState(form?.resumeStrict ?? false);
  const fields = form?.fields ?? initialFields;

  return (
    <form action={action} className="max-w-3xl space-y-5">
      {form && <input type="hidden" name="id" value={form.id} />}
      <FormError state={state} />

      <Field label="Form name" name="name" state={state}>
        <Input id="name" name="name" defaultValue={form?.name} required placeholder="e.g. Standard Job Application" />
      </Field>

      <Field label="Description (internal)" name="description" state={state}>
        <Input id="description" name="description" defaultValue={form?.description ?? ""} placeholder="What this form is used for" />
      </Field>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isTemplate" defaultChecked={form?.isTemplate ?? false} className="h-4 w-4 rounded border-input" />
          Save as a reusable <strong>template</strong> (offered when creating new forms)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="requireCv" defaultChecked={form?.requireCv ?? true} className="h-4 w-4 rounded border-input" />
          Require a CV upload with the application
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="resumeStrict"
            checked={resumeStrict}
            onChange={(e) => setResumeStrict(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Require a <strong>strict resume format</strong> (show applicants a template link)
        </label>
        {resumeStrict && (
          <Field label="Resume template URL" name="resumeTemplateUrl" state={state}>
            <Input
              id="resumeTemplateUrl"
              name="resumeTemplateUrl"
              type="url"
              defaultValue={form?.resumeTemplateUrl ?? ""}
              placeholder="https://docs.google.com/document/…"
            />
          </Field>
        )}
      </div>

      <div>
        <p className="text-sm font-medium">Form fields</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Mark one text field as “Applicant name”, one email field as “Applicant email”, and one phone field as
          “Applicant phone” so applications land in the inbox with searchable contact details.
        </p>
        <FormBuilder name="fields" defaultValue={fields} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton>{form ? "Save changes" : "Create form"}</SubmitButton>
        <Link href="/admin/careers/forms" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
