"use client";

import { useActionState } from "react";
import { savePageSection } from "@/lib/actions/pages";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError, FormSuccess } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";

export function SectionEditor({
  sectionKey,
  label,
  content,
}: {
  sectionKey: string;
  label: string;
  content: string;
}) {
  const [state, action] = useActionState(savePageSection, null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-3">
          <input type="hidden" name="key" value={sectionKey} />
          <Textarea name="content" rows={8} defaultValue={content} className="font-mono text-xs" />
          <FormError state={state} />
          <FormSuccess state={state} message="Section saved and published." />
          <SubmitButton>Save section</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
