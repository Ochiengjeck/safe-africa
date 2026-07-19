import type { Role } from "@/lib/generated/prisma/client";

/** Pure role ranking, safe to import from client components. */
export const ROLE_RANK: Record<Role, number> = {
  EDITOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export function hasRole(role: Role, minimum: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}
