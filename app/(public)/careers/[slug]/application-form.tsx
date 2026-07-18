"use client";

import { useActionState } from "react";
import { submitApplication } from "@/lib/actions/public";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";

export function ApplicationForm({ vacancyId }: { vacancyId: string }) {
  const [state, action] = useActionState(submitApplication, null);

  if (state?.ok) {
    return (
      <p className="mt-6 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
        Thank you — your application has been received. We will be in touch if you are shortlisted.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="vacancyId" value={vacancyId} />
      {/* Honeypot — humans never see or fill this field */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <FormError state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" state={state}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" name="email" state={state}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>
      <Field label="Phone" name="phone" state={state}>
        <Input id="phone" name="phone" type="tel" autoComplete="tel" required />
      </Field>
      <Field label="Cover letter" name="coverLetter" state={state}>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          required
          placeholder="Tell us why you are a great fit for this role."
        />
      </Field>
      <UploadField name="cvUrl" folder="safe-africa/cvs" label="CV (PDF or Word)" accept=".pdf,.doc,.docx" />
      <SubmitButton>Submit application</SubmitButton>
    </form>
  );
}
