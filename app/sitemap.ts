import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.AUTH_URL?.startsWith("https")
  ? process.env.AUTH_URL
  : "https://safeafrika.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, areas, vacancies] = await Promise.all([
    prisma.project.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.thematicArea.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.vacancy.findMany({ where: { status: "OPEN" }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticPages = ["", "/about", "/thematic-areas", "/services", "/projects", "/resources", "/careers", "/media-events", "/contact"];

  return [
    ...staticPages.map((path) => ({ url: `${BASE}${path}`, lastModified: new Date() })),
    ...areas.map((area) => ({ url: `${BASE}/thematic-areas/${area.slug}`, lastModified: area.updatedAt })),
    ...projects.map((project) => ({ url: `${BASE}/projects/${project.slug}`, lastModified: project.updatedAt })),
    ...vacancies.map((vacancy) => ({ url: `${BASE}/careers/${vacancy.slug}`, lastModified: vacancy.updatedAt })),
  ];
}
