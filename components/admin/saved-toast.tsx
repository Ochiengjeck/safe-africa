"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Shows a success toast when the page was reached via a server-action
 * redirect carrying ?saved=<message>, then strips the param so refreshes
 * don't re-toast.
 */
export function SavedToast() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const saved = searchParams.get("saved");
    if (!saved) return;
    toast.success(saved);
    const params = new URLSearchParams(searchParams);
    params.delete("saved");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  return null;
}
