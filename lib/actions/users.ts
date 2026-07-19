"use server";

import { hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { userSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";

export async function saveUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireRole("SUPER_ADMIN");
  const parsed = parseForm(userSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, password, ...data } = parsed.data;
  const email = data.email.toLowerCase();

  if (id) {
    if (id === session.user.id && !data.active) {
      return { error: "You cannot deactivate your own account." };
    }
    await prisma.user.update({
      where: { id },
      data: { ...data, email, ...(password ? { passwordHash: await hash(password, 12) } : {}) },
    });
  } else {
    if (!password) return { error: "Password is required for new users.", fieldErrors: { password: ["Required"] } };
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "A user with this email already exists." };
    await prisma.user.create({ data: { ...data, email, passwordHash: await hash(password, 12) } });
  }
  redirect("/admin/users?saved=User+saved");
}

export async function deleteUser(id: string) {
  const session = await requireRole("SUPER_ADMIN");
  if (id === session.user.id) throw new Error("You cannot delete your own account.");
  await prisma.user.delete({ where: { id } });
}
