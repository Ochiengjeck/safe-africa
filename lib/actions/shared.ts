import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/format";

/**
 * The public site is small, so after any admin write we revalidate everything
 * under the root layout rather than tracking per-module path lists. This keeps
 * publishing instant and makes it impossible to forget a path.
 */
export function revalidatePublic() {
  revalidatePath("/", "layout");
}

/** Builds a unique slug from a title, appending -2, -3, … on collision. */
export async function uniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
  currentSlug?: string
) {
  const base = slugify(title) || "item";
  let candidate = base;
  let n = 2;
  while (candidate !== currentSlug && (await exists(candidate))) {
    candidate = `${base}-${n++}`;
  }
  return candidate;
}
