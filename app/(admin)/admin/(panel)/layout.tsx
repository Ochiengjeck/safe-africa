import { Suspense } from "react";
import { Toaster } from "sonner";
import { requireSession } from "@/lib/authz";
import { AdminShell } from "@/components/admin/admin-shell";
import { SavedToast } from "@/components/admin/saved-toast";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <>
      <AdminShell user={{ name: session.user.name, role: session.user.role }}>{children}</AdminShell>
      <Toaster position="bottom-right" richColors closeButton />
      <Suspense>
        <SavedToast />
      </Suspense>
    </>
  );
}
