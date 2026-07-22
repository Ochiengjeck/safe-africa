"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveResource } from "@/lib/actions/resources";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import { RichTextEditor } from "@/components/rich-text/editor";
import type { Resource, ThematicArea } from "@/lib/generated/prisma/client";

type ResourceFormProps = {
  resource?: Resource;
  thematicAreas: Pick<ThematicArea, "id" | "title">[];
};

export function ResourceForm({ resource, thematicAreas }: ResourceFormProps) {
  const [state, action] = useActionState(saveResource, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {resource && <input type="hidden" name="id" value={resource.id} />}
      <FormError state={state} />
      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={resource?.title} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" name="type" state={state}>
          <select
            id="type"
            name="type"
            defaultValue={resource?.type ?? "PUBLICATION"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="PUBLICATION">Publication</option>
            <option value="REPORT">Report</option>
            <option value="POLICY_BRIEF">Policy brief</option>
            <option value="TOOLKIT">Toolkit</option>
            <option value="RESEARCH">Research paper</option>
          </select>
        </Field>
        <Field label="Thematic area (optional)" name="thematicAreaId" state={state}>
          <select
            id="thematicAreaId"
            name="thematicAreaId"
            defaultValue={resource?.thematicAreaId ?? ""}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">None</option>
            {thematicAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.title}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description" name="description" state={state}>
        <RichTextEditor name="description" defaultValue={resource?.description ?? ""} />
      </Field>
      <UploadField
        name="fileUrl"
        folder="safe-africa/resources"
        label="File (PDF/document)"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        defaultUrl={resource?.fileUrl}
        required
      />
      <UploadField
        name="coverImage"
        folder="safe-africa/resources"
        label="Cover image (optional)"
        accept="image/*"
        defaultUrl={resource?.coverImage ?? undefined}
      />
      <div className="flex items-center gap-3">
        <SubmitButton>{resource ? "Save changes" : "Create resource"}</SubmitButton>
        <Link href="/admin/resources" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
