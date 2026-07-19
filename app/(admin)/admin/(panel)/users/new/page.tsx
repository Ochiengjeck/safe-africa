import { requireSession } from "@/lib/authz";
import { AccessDenied } from "@/components/admin/access-denied";
import { UserForm } from "../user-form";

export const metadata = { title: "New User — SAFE Africa CMS" };

export default async function NewUserPage() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") {
    return <AccessDenied currentRole={session.user.role} requiredRole="SUPER_ADMIN" feature="User management" />;
  }
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">New admin user</h1>
      <UserForm />
    </div>
  );
}
