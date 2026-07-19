import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PostsTable } from "./posts-table";

export const metadata = { title: "Media & Events — SAFE Africa CMS" };

export default async function AdminMediaPage() {
  const posts = await prisma.post.findMany({ where: { deletedAt: null }, orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Media & events</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/media/gallery">Photo gallery</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/media/new">New post</Link>
          </Button>
        </div>
      </div>
      <Suspense>
        <PostsTable posts={posts} />
      </Suspense>
    </div>
  );
}
