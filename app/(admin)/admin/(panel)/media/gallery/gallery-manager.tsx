"use client";

import Image from "next/image";
import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGalleryImage, deleteGalleryImage } from "@/lib/actions/posts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { UploadField } from "@/components/upload-field";
import type { GalleryImage } from "@/lib/generated/prisma/client";

export function GalleryManager({ images }: { images: GalleryImage[] }) {
  const [state, action] = useActionState(saveGalleryImage, null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-8">
      <Card className="max-w-xl">
        <CardContent className="pt-6">
          <form action={action} className="space-y-4">
            <FormError state={state} />
            <UploadField name="url" folder="safe-africa/gallery" label="Image" accept="image/*" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Caption" name="caption" state={state}>
                <Input id="caption" name="caption" />
              </Field>
              <Field label="Category" name="category" state={state}>
                <Input id="category" name="category" placeholder="e.g. Fieldwork" />
              </Field>
            </div>
            <SubmitButton>Add to gallery</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((image) => (
          <figure key={image.id} className="space-y-2 rounded-lg border p-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
              <Image src={image.url} alt={image.caption ?? ""} fill className="object-cover" sizes="300px" />
            </div>
            <figcaption className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate">{image.caption ?? "—"}</span>
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteGalleryImage(image.id);
                    router.refresh();
                  })
                }
              >
                Remove
              </Button>
            </figcaption>
          </figure>
        ))}
        {images.length === 0 && <p className="text-sm text-muted-foreground">No gallery images yet.</p>}
      </div>
    </div>
  );
}
