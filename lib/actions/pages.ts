"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { pageSectionSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { revalidatePublic } from "@/lib/actions/shared";

export async function savePageSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("EDITOR");
  const parsed = parseForm(pageSectionSchema, formData);
  if (!parsed.ok) return parsed.state;
  const content = JSON.parse(parsed.data.content);

  await prisma.pageSection.upsert({
    where: { key: parsed.data.key },
    update: { content },
    create: { key: parsed.data.key, content },
  });
  revalidatePublic();
  return { ok: true };
}
