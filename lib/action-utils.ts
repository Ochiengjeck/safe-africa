import { z } from "zod";

/** Shared result shape for all server actions driven by useActionState. */
export type ActionState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

/**
 * Parses a FormData against a Zod schema. Empty strings become undefined so
 * optional fields work naturally with HTML forms; checkboxes arrive as "on".
 */
export function parseForm<T extends z.ZodType>(
  schema: T,
  formData: FormData
): { ok: true; data: z.infer<T> } | { ok: false; state: ActionState } {
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("$")) continue; // React internal fields
    if (key.endsWith("[]")) {
      const name = key.slice(0, -2);
      raw[name] = [...(raw[name] as unknown[] | undefined ?? []), value];
    } else {
      raw[key] = value === "" ? undefined : value;
    }
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".") || "_";
      (fieldErrors[path] ??= []).push(issue.message);
    }
    return { ok: false, state: { error: "Please fix the highlighted fields.", fieldErrors } };
  }
  return { ok: true, data: result.data };
}

export const checkbox = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
export const optionalDate = z.coerce.date().optional();
export const orderField = z.coerce.number().int().min(0).default(0);
