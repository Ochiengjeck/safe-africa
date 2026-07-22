"use client";

import { useActionState } from "react";
import { submitApplication } from "@/lib/actions/public";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadField } from "@/components/upload-field";
import { SubmitButton } from "@/components/admin/submit-button";
import { FormError } from "@/components/admin/field";
import { FIELD_PREFIX, type FormField } from "@/lib/careers/form-fields";
import type { ActionState } from "@/lib/action-utils";

const INPUT_CLASS = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

function FieldErrors({ state, id }: { state: ActionState; id: string }) {
  const errors = state?.fieldErrors?.[id];
  if (!errors) return null;
  return (
    <div role="alert" className="mt-1">
      {errors.map((e) => (
        <p key={e} className="text-xs text-destructive">{e}</p>
      ))}
    </div>
  );
}

export function ApplicationForm({
  vacancyId,
  fields,
  requireCv,
  resumeStrict,
  resumeTemplateUrl,
}: {
  vacancyId: string;
  fields: FormField[];
  requireCv: boolean;
  resumeStrict: boolean;
  resumeTemplateUrl?: string | null;
}) {
  const [state, action] = useActionState(submitApplication, null);

  if (state?.ok) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 text-center">
        <p className="font-display text-lg font-semibold text-primary">Application received — thank you!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          We've emailed you a confirmation. We acknowledge all applications but contact only shortlisted candidates.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5">
      <input type="hidden" name="vacancyId" value={vacancyId} />
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <FormError state={state} />

      {fields.map((field) => {
        if (field.type === "section") {
          return (
            <h3 key={field.id} className="font-display border-b pb-1 pt-2 text-base font-semibold">
              {field.label}
            </h3>
          );
        }
        if (field.type === "file") return null; // CV handled below

        const name = `${FIELD_PREFIX}${field.id}`;

        return (
          <div key={field.id} className="space-y-1.5">
            {field.type !== "consent" && (
              <span className="text-sm font-medium">
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </span>
            )}

            {field.type === "long_text" && (
              <Textarea id={name} name={name} rows={5} required={field.required} placeholder={field.placeholder} />
            )}
            {["short_text", "email", "phone", "url", "number", "date"].includes(field.type) && (
              <Input
                id={name}
                name={name}
                type={field.type === "short_text" ? "text" : field.type === "phone" ? "tel" : field.type}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
            {field.type === "select" && (
              <select id={name} name={name} required={field.required} defaultValue="" className={INPUT_CLASS}>
                <option value="" disabled>Choose…</option>
                {(field.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {field.type === "yes_no" && (
              <div className="flex gap-4">
                {(field.options ?? ["Yes", "No"]).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="radio" name={name} value={opt} required={field.required} className="h-4 w-4 border-input" />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {field.type === "multiselect" && (
              <div className="grid gap-2 sm:grid-cols-2">
                {(field.options ?? []).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name={`${name}[]`} value={opt} className="h-4 w-4 rounded border-input" />
                    {opt}
                  </label>
                ))}
              </div>
            )}
            {field.type === "consent" && (
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name={name} className="mt-0.5 h-4 w-4 rounded border-input" />
                <span>{field.label}</span>
              </label>
            )}

            {field.helpText && <p className="text-xs text-muted-foreground">{field.helpText}</p>}
            <FieldErrors state={state} id={field.id} />
          </div>
        );
      })}

      {(requireCv || resumeStrict) && (
        <div className="space-y-1.5 rounded-lg border bg-muted/30 p-4">
          {resumeStrict && resumeTemplateUrl && (
            <p className="text-sm text-muted-foreground">
              This role requires a specific CV format.{" "}
              <a href={resumeTemplateUrl} target="_blank" rel="noreferrer" className="font-medium text-primary underline">
                Download the resume template
              </a>
              . Applications in a different format may not be reviewed.
            </p>
          )}
          <UploadField
            name="cvUrl"
            folder="safe-africa/cvs"
            label={`CV / resume (PDF or Word)${requireCv ? " *" : ""}`}
            accept=".pdf,.doc,.docx"
          />
          <FieldErrors state={state} id="cvUrl" />
        </div>
      )}

      <SubmitButton>Submit application</SubmitButton>
    </form>
  );
}
