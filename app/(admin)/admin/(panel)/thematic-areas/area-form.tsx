"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveThematicArea } from "@/lib/actions/thematic-areas";
import { Input } from "@/components/ui/input";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import { RichTextEditor } from "@/components/rich-text/editor";
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
        <RichTextEditor name="description" defaultValue={area?.description} />
      </Field>
      <Field label="Our impact" name="impact" state={state}>
        <RichTextEditor name="impact" defaultValue={area?.impact} />
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
      <div className="flex items-center gap-3">
        <SubmitButton>{area ? "Save changes" : "Create area"}</SubmitButton>
        <Link href="/admin/thematic-areas" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
