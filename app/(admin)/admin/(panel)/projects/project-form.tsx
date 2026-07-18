"use client";

import { useActionState } from "react";
import { saveProject } from "@/lib/actions/projects";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import type { Project, ThematicArea } from "@/lib/generated/prisma/client";

type ProjectFormProps = {
  project?: Project & { thematicAreas: { id: string }[] };
  thematicAreas: Pick<ThematicArea, "id" | "title">[];
};

const toDateInput = (date: Date | null | undefined) => (date ? date.toISOString().slice(0, 10) : "");

export function ProjectForm({ project, thematicAreas }: ProjectFormProps) {
  const [state, action] = useActionState(saveProject, null);
  const selected = new Set(project?.thematicAreas.map((area) => area.id));

  return (
    <form action={action} className="max-w-3xl space-y-5">
      {project && <input type="hidden" name="id" value={project.id} />}
      <FormError state={state} />

      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={project?.title} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Client" name="client" state={state}>
          <Input id="client" name="client" defaultValue={project?.client} required />
        </Field>
        <Field label="Location" name="location" state={state}>
          <Input id="location" name="location" defaultValue={project?.location} required />
        </Field>
        <Field label="Period start" name="periodStart" state={state}>
          <Input id="periodStart" name="periodStart" type="date" defaultValue={toDateInput(project?.periodStart)} required />
        </Field>
        <Field label="Period end (empty = ongoing)" name="periodEnd" state={state}>
          <Input id="periodEnd" name="periodEnd" type="date" defaultValue={toDateInput(project?.periodEnd)} />
        </Field>
      </div>
      <Field label="Project overview" name="overview" state={state}>
        <Textarea id="overview" name="overview" rows={4} defaultValue={project?.overview} required />
      </Field>
      <Field label="SAFE Africa's role" name="role" state={state}>
        <Textarea id="role" name="role" rows={4} defaultValue={project?.role} required />
      </Field>
      <Field label="Scale and results" name="scaleResults" state={state}>
        <Textarea id="scaleResults" name="scaleResults" rows={3} defaultValue={project?.scaleResults} required />
      </Field>

      <Field label="Thematic areas" name="thematicAreaIds" state={state}>
        <div className="grid gap-2 sm:grid-cols-2">
          {thematicAreas.map((area) => (
            <label key={area.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="thematicAreaIds[]"
                value={area.id}
                defaultChecked={selected.has(area.id)}
                className="h-4 w-4 rounded border-input"
              />
              {area.title}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Status" name="status" state={state}>
          <select
            id="status"
            name="status"
            defaultValue={project?.status ?? "DRAFT"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={project?.featured}
            className="h-4 w-4 rounded border-input"
          />
          Feature on homepage
        </label>
      </div>

      <UploadField
        name="coverImage"
        folder="safe-africa/projects"
        label="Cover image"
        accept="image/*"
        defaultUrl={project?.coverImage ?? undefined}
      />

      <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
    </form>
  );
}
