import { requireSession } from "@/lib/authz";
import { redirect } from "next/navigation";
import { UserForm } from "../user-form";

export const metadata = { title: "New User — SAFE Africa CMS" };

export default async function NewUserPage() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New admin user</h1>
      <UserForm />
    </div>
  );
}
