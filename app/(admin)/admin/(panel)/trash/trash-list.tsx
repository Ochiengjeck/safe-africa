"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { restoreItem, permanentlyDeleteItem, type TrashKind } from "@/lib/actions/trash";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export type TrashEntry = {
  kind: TrashKind;
  kindLabel: string;
  id: string;
  title: string;
  deletedAt: string;
};

export function TrashList({ entries, canPurge }: { entries: TrashEntry[]; canPurge: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [purging, setPurging] = useState<TrashEntry | null>(null);

  if (entries.length === 0) {
    return <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">Trash is empty.</p>;
  }

  return (
    <>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={`${entry.kind}:${entry.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{entry.kindLabel}</Badge>
                <p className="truncate text-sm font-medium">{entry.title}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Deleted {entry.deletedAt}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await restoreItem(entry.kind, entry.id);
                    router.refresh();
                    toast.success(`Restored ${entry.kindLabel.toLowerCase()} “${entry.title}”`);
                  })
                }
              >
                Restore
              </Button>
              {canPurge && (
                <Button variant="destructive" size="sm" disabled={pending} onClick={() => setPurging(entry)}>
                  Delete forever
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={purging !== null}
        pending={pending}
        title={`Permanently delete ${purging?.kindLabel.toLowerCase()} “${purging?.title}”?`}
        description="This removes it from the database forever and cannot be undone."
        confirmLabel="Delete forever"
        onCancel={() => setPurging(null)}
        onConfirm={() => {
          if (!purging) return;
          startTransition(async () => {
            await permanentlyDeleteItem(purging.kind, purging.id);
            setPurging(null);
            router.refresh();
            toast.success("Permanently deleted.");
          });
        }}
      />
    </>
  );
}
