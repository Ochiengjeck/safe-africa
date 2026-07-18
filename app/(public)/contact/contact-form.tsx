"use client";

import { useActionState } from "react";
import { submitContact } from "@/lib/actions/public";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

export function ContactForm() {
  const [state, action] = useActionState(submitContact, null);

  if (state?.ok) {
    return (
      <p className="mt-6 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
        Thank you — your message has been sent. We will get back to you shortly.
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-5">
      {/* Honeypot — humans never see or fill this field */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <FormError state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" name="name" state={state}>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" name="email" state={state}>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
      </div>
      <Field label="Subject" name="subject" state={state}>
        <Input id="subject" name="subject" />
      </Field>
      <Field label="Message" name="message" state={state}>
        <Textarea id="message" name="message" rows={6} required />
      </Field>
      <SubmitButton>Send message</SubmitButton>
    </form>
  );
}
