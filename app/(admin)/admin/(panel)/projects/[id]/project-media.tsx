"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addProjectImage,
  deleteProjectImage,
  addProjectAttachment,
  deleteProjectAttachment,
} from "@/lib/actions/projects";
import { UploadField } from "@/components/upload-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProjectImage, ProjectAttachment } from "@/lib/generated/prisma/client";

/**
 * Gallery images and report attachments for a project. Uploads land in a local
 * pending state (via UploadField's hidden inputs inside small forms), then are
 * attached through server actions.
 */
export function ProjectMedia({
  projectId,
  images,
  attachments,
}: {
  projectId: string;
  images: ProjectImage[];
  attachments: ProjectAttachment[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [attachmentName, setAttachmentName] = useState("");

  function attachImage(formData: FormData) {
    const url = formData.get("url");
    if (typeof url !== "string" || !url) return;
    startTransition(async () => {
      await addProjectImage(projectId, url);
      router.refresh();
    });
  }

  function attachFile(formData: FormData) {
    const url = formData.get("url");
    if (typeof url !== "string" || !url) return;
    startTransition(async () => {
      await addProjectAttachment(projectId, url, attachmentName || "Report");
      setAttachmentName("");
      router.refresh();
    });
  }

  return (
    <div className="grid max-w-3xl gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gallery images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {images.map((image) => (
              <li key={image.id} className="flex items-center justify-between gap-2">
                <a href={image.url} target="_blank" rel="noreferrer" className="truncate underline">
                  {image.url.split("/").pop()}
                </a>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteProjectImage(image.id);
                      router.refresh();
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
            {images.length === 0 && <li className="text-muted-foreground">No images yet.</li>}
          </ul>
          <form action={attachImage} className="space-y-2">
            <UploadField name="url" folder="safe-africa/projects" accept="image/*" />
            <Button type="submit" size="sm" disabled={pending}>
              Add image
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reports & attachments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex items-center justify-between gap-2">
                <a href={attachment.url} target="_blank" rel="noreferrer" className="truncate underline">
                  {attachment.name}
                </a>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteProjectAttachment(attachment.id);
                      router.refresh();
                    })
                  }
                >
                  Remove
                </Button>
              </li>
            ))}
            {attachments.length === 0 && <li className="text-muted-foreground">No attachments yet.</li>}
          </ul>
          <form action={attachFile} className="space-y-2">
            <Input
              placeholder="Attachment name (e.g. Final Report)"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
            />
            <UploadField name="url" folder="safe-africa/resources" accept=".pdf,.doc,.docx" />
            <Button type="submit" size="sm" disabled={pending}>
              Add attachment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
