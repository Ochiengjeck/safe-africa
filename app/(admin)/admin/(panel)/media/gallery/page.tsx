import { prisma } from "@/lib/prisma";
import { GalleryManager } from "./gallery-manager";

export const metadata = { title: "Photo Gallery — SAFE Africa CMS" };

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Photo gallery</h1>
      <GalleryManager images={images} />
    </div>
  );
}
