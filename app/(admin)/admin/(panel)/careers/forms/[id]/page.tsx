import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordMeta } from "@/components/admin/record-meta";
import { FormEditor } from "../form-editor";
import type { FormField } from "@/lib/careers/form-fields";

export const metadata = { title: "Edit Application Form — SAFE Africa CMS" };

export default async function EditApplicationFormPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const form = await prisma.applicationForm.findFirst({ where: { id, deletedAt: null } });
  if (!form) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Edit application form</h1>
        <RecordMeta createdAt={form.createdAt} updatedAt={form.updatedAt} />
      </div>
      <FormEditor
        form={{
          id: form.id,
          name: form.name,
          description: form.description,
          fields: form.fields as FormField[],
          isTemplate: form.isTemplate,
          requireCv: form.requireCv,
          resumeStrict: form.resumeStrict,
          resumeTemplateUrl: form.resumeTemplateUrl,
        }}
      />
    </div>
  );
}
