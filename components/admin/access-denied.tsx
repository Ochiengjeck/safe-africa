import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/generated/prisma/client";

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

/**
 * Explanatory access-denied card shown in place of gated pages — never a
 * silent redirect or a bare 403 (ux-admin-portal RBAC guidance).
 */
export function AccessDenied({
  currentRole,
  requiredRole,
  feature,
}: {
  currentRole: Role;
  requiredRole: Role;
  feature: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border bg-card p-8 text-center shadow-sm">
      <ShieldAlert className="mx-auto h-10 w-10 text-brand-orange-deep" aria-hidden="true" />
      <h1 className="font-display mt-4 text-xl font-semibold">You don&apos;t have access to {feature}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Your role is <strong>{ROLE_LABELS[currentRole]}</strong>. {feature} requires the{" "}
        <strong>{ROLE_LABELS[requiredRole]}</strong> role. If you need access, ask a Super Admin to
        upgrade your account under Users.
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/admin">Back to dashboard</Link>
      </Button>
    </div>
  );
}
