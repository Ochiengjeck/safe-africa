import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { PostsTable } from "./posts-table";

export const metadata = { title: "Media & Events — SAFE Africa CMS" };

export default async function AdminMediaPage() {
  const posts = await prisma.post.findMany({ where: { deletedAt: null }, orderBy: { publishedAt: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Content"
        title="Media & events"
        subtitle="News posts, event write-ups, and the photo gallery."
        actions={
          <>
            <Button asChild variant="outline"><Link href="/admin/media/gallery">Photo gallery</Link></Button>
            <Button asChild><Link href="/admin/media/new">New post</Link></Button>
          </>
        }
      />
      <Suspense>
        <PostsTable posts={posts} />
      </Suspense>
    </div>
  );
}
