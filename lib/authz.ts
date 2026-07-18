import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Role } from "@/lib/generated/prisma/client";

const ROLE_RANK: Record<Role, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

/** Returns the session or redirects to the admin login. Use in admin layouts/pages. */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

/**
 * Guards server actions. Proxy matchers do not cover Server Action POSTs,
 * so every admin action must call this before touching data.
 * Throws instead of redirecting so actions fail loudly when called without a session.
 */
export async function requireRole(minimum: Role = "EDITOR") {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (ROLE_RANK[session.user.role] < ROLE_RANK[minimum]) throw new Error("Forbidden");
  return session;
}

export function hasRole(role: Role, minimum: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
