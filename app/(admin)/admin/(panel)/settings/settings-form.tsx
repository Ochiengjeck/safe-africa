"use client";

import { useActionState } from "react";
import { saveSettings } from "@/lib/actions/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError, FormSuccess } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

type SettingsDefaults = {
  address: string;
  poBox: string;
  phone: string;
  email: string;
  linkedin: string;
  twitter: string;
  facebook: string;
  mapEmbedUrl: string;
};

export function SettingsForm({ defaults }: { defaults: SettingsDefaults }) {
  const [state, action] = useActionState(saveSettings, null);
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <FormError state={state} />
      <FormSuccess state={state} message="Settings saved and published." />
      <Field label="Office address" name="address" state={state}>
        <Textarea id="address" name="address" rows={2} defaultValue={defaults.address} required />
      </Field>
      <Field label="Postal address" name="poBox" state={state}>
        <Input id="poBox" name="poBox" defaultValue={defaults.poBox} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" state={state}>
          <Input id="phone" name="phone" defaultValue={defaults.phone} required />
        </Field>
        <Field label="Email" name="email" state={state}>
          <Input id="email" name="email" type="email" defaultValue={defaults.email} required />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="LinkedIn URL" name="linkedin" state={state}>
          <Input id="linkedin" name="linkedin" defaultValue={defaults.linkedin} />
        </Field>
        <Field label="X / Twitter URL" name="twitter" state={state}>
          <Input id="twitter" name="twitter" defaultValue={defaults.twitter} />
        </Field>
        <Field label="Facebook URL" name="facebook" state={state}>
          <Input id="facebook" name="facebook" defaultValue={defaults.facebook} />
        </Field>
      </div>
      <Field label="Google Maps embed URL" name="mapEmbedUrl" state={state}>
        <Input id="mapEmbedUrl" name="mapEmbedUrl" defaultValue={defaults.mapEmbedUrl} />
      </Field>
      <SubmitButton>Save settings</SubmitButton>
    </form>
  );
}
