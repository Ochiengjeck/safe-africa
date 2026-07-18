"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { settingsSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic } from "@/lib/actions/shared";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("SUPER_ADMIN");
  const parsed = parseForm(settingsSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { linkedin, twitter, facebook, ...data } = parsed.data;

  await prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { ...data, socialLinks: { linkedin: linkedin ?? "", twitter: twitter ?? "", facebook: facebook ?? "" } },
    create: {
      id: 1,
      ...data,
      socialLinks: { linkedin: linkedin ?? "", twitter: twitter ?? "", facebook: facebook ?? "" },
      impactStats: {},
    },
  });
  revalidatePublic();
  return { ok: true };
}
