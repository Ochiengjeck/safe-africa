import { prisma } from "@/lib/prisma";

/**
 * Reads a structured PageSection by key, falling back to `fallback` when the
 * row is missing or malformed so public pages never crash on content edits.
 */
export async function getSection<T>(key: string, fallback: T): Promise<T> {
  try {
    const section = await prisma.pageSection.findUnique({ where: { key } });
    if (!section || section.content === null) return fallback;
    return { ...fallback, ...(section.content as T) };
  } catch {
    return fallback;
  }
}

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  const socialLinks = (settings?.socialLinks ?? {}) as Record<string, string>;
  return {
    address: settings?.address ?? "Greenhouse Mall, Ngong Road, Nairobi, Kenya",
    poBox: settings?.poBox ?? "",
    phone: settings?.phone ?? "+254 742 322 296",
    email: settings?.email ?? "info@safeafrika.com",
    mapEmbedUrl: settings?.mapEmbedUrl ?? "",
    socialLinks,
  };
}
