"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveService } from "@/lib/actions/services";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import type { Service } from "@/lib/generated/prisma/client";

export function ServiceForm({ service }: { service?: Service }) {
  const [state, action] = useActionState(saveService, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {service && <input type="hidden" name="id" value={service.id} />}
      <FormError state={state} />
      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={service?.title} required />
      </Field>
      <Field label="Description" name="description" state={state}>
        <Textarea id="description" name="description" rows={4} defaultValue={service?.description} required />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon (lucide name)" name="icon" state={state}>
          <Input id="icon" name="icon" defaultValue={service?.icon ?? ""} />
        </Field>
        <Field label="Display order" name="order" state={state}>
          <Input id="order" name="order" type="number" min={0} defaultValue={service?.order ?? 0} />
        </Field>
      </div>
      <UploadField
        name="image"
        folder="safe-africa/general"
        label="Image"
        accept="image/*"
        defaultUrl={service?.image ?? undefined}
      />
      <div className="flex items-center gap-3">
        <SubmitButton>{service ? "Save changes" : "Create service"}</SubmitButton>
        <Link href="/admin/services" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
