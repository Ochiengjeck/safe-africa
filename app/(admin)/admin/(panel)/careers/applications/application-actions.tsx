"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateApplicationStatus, deleteApplication } from "@/lib/actions/careers";
import { restoreItem } from "@/lib/actions/trash";
import type { ApplicationStatus } from "@/lib/generated/prisma/client";

const STATUSES: ApplicationStatus[] = ["NEW", "REVIEWED", "SHORTLISTED", "REJECTED"];

export function ApplicationActions({ id, status }: { id: string; status: ApplicationStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(next: ApplicationStatus) {
    startTransition(async () => {
      await updateApplicationStatus(id, next);
      router.refresh();
      toast.success(`Marked ${next.toLowerCase()}`);
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteApplication(id);
      toast.success("Application deleted", {
        action: { label: "Undo", onClick: () => restoreItem("application", id).then(() => router.refresh()) },
      });
      router.push("/admin/careers/applications");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUSES.filter((s) => s !== status).map((s) => (
        <Button key={s} variant="outline" size="sm" disabled={pending} onClick={() => setStatus(s)}>
          Mark {s.toLowerCase()}
        </Button>
      ))}
      <Button asChild size="sm">
        <Link href={`/admin/careers/interviews/new?applicationId=${id}`}>Schedule interview</Link>
      </Button>
      <Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={remove}>
        Delete
      </Button>
    </div>
  );
}
