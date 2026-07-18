import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/authz";
import { UserForm } from "../user-form";

export const metadata = { title: "Edit User — SAFE Africa CMS" };

export default async function EditUserPage(props: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const { id } = await props.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  if (!user) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit user</h1>
      <UserForm user={user} />
    </div>
  );
}
