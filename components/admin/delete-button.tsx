"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

type DeleteButtonProps = {
  /** Bound server action that soft-deletes (or hard-deletes) the resource. */
  action: () => Promise<void>;
  /** Bound server action that undoes the delete; enables the Undo toast. */
  restore?: () => Promise<void>;
  /** Names the specific resource, e.g. `project "KJADE Baseline Evaluation"`. */
  resourceLabel: string;
  description?: string;
  label?: string;
};

export function DeleteButton({ action, restore, resourceLabel, description, label = "Delete" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await action();
        setOpen(false);
        router.refresh();
        if (restore) {
          toast.success(`Deleted ${resourceLabel}`, {
            duration: 8000,
            action: {
              label: "Undo",
              onClick: () =>
                startTransition(async () => {
                  await restore();
                  router.refresh();
                  toast.success(`Restored ${resourceLabel}`);
                }),
            },
          });
        } else {
          toast.success(`Deleted ${resourceLabel}`);
        }
      } catch {
        setOpen(false);
        toast.error(`Could not delete ${resourceLabel}.`);
      }
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ConfirmDialog
        open={open}
        pending={pending}
        title={`Delete ${resourceLabel}?`}
        description={
          description ?? (restore ? "It will move to Trash and can be restored." : "This cannot be undone.")
        }
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
