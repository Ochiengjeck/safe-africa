"use client";

import { useActionState } from "react";
import { saveThematicArea } from "@/lib/actions/thematic-areas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import type { ThematicArea } from "@/lib/generated/prisma/client";

export function AreaForm({ area }: { area?: ThematicArea }) {
  const [state, action] = useActionState(saveThematicArea, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {area && <input type="hidden" name="id" value={area.id} />}
      <FormError state={state} />
      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={area?.title} required />
      </Field>
      <Field label="Tagline" name="tagline" state={state}>
        <Input id="tagline" name="tagline" defaultValue={area?.tagline} required />
      </Field>
      <Field label="Description" name="description" state={state}>
        <Textarea id="description" name="description" rows={5} defaultValue={area?.description} required />
      </Field>
      <Field label="Our impact" name="impact" state={state}>
        <Textarea id="impact" name="impact" rows={5} defaultValue={area?.impact} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon (lucide name, e.g. sprout)" name="icon" state={state}>
          <Input id="icon" name="icon" defaultValue={area?.icon ?? ""} />
        </Field>
        <Field label="Display order" name="order" state={state}>
          <Input id="order" name="order" type="number" min={0} defaultValue={area?.order ?? 0} />
        </Field>
      </div>
      <UploadField
        name="coverImage"
        folder="safe-africa/general"
        label="Cover image"
        accept="image/*"
        defaultUrl={area?.coverImage ?? undefined}
      />
      <SubmitButton>{area ? "Save changes" : "Create area"}</SubmitButton>
    </form>
  );
}
