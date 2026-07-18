"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type DeleteButtonProps = {
  /** Bound server action, e.g. deleteProject.bind(null, id) */
  action: () => Promise<void>;
  label?: string;
  confirmText?: string;
};

export function DeleteButton({ action, label = "Delete", confirmText = "Delete this item? This cannot be undone." }: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        startTransition(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      {pending ? "…" : label}
    </Button>
  );
}
