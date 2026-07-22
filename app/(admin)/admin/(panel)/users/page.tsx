import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { AccessDenied } from "@/components/admin/access-denied";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { UsersTable } from "./users-table";

export const metadata = { title: "Users — SAFE Africa CMS" };

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return <AccessDenied currentRole={session.user.role} requiredRole="SUPER_ADMIN" feature="User management" />;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Admin users"
        subtitle="People who can sign in to this CMS, and their roles."
        actions={<Button asChild><Link href="/admin/users/new">New user</Link></Button>}
      />
      <Suspense>
        <UsersTable users={users} currentUserId={session.user.id} />
      </Suspense>
    </div>
  );
}
