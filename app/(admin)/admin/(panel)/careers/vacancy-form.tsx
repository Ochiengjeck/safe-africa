"use client";

import { useActionState } from "react";
import { saveVacancy } from "@/lib/actions/careers";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/rich-text/editor";
import type { Vacancy } from "@/lib/generated/prisma/client";

export function VacancyForm({ vacancy }: { vacancy?: Vacancy }) {
  const [state, action] = useActionState(saveVacancy, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {vacancy && <input type="hidden" name="id" value={vacancy.id} />}
      <FormError state={state} />
      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={vacancy?.title} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Type" name="type" state={state}>
          <select
            id="type"
            name="type"
            defaultValue={vacancy?.type ?? "JOB"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
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
      <Field label="Description" name="description" state={state}>
        <RichTextEditor name="description" defaultValue={vacancy?.description} />
      </Field>
      <Field label="Status" name="status" state={state}>
        <select
          id="status"
          name="status"
          defaultValue={vacancy?.status ?? "OPEN"}
          className="h-9 w-full max-w-48 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </select>
      </Field>
      <SubmitButton>{vacancy ? "Save changes" : "Create vacancy"}</SubmitButton>
    </form>
  );
}
