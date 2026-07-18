import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePost } from "@/lib/actions/posts";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Media & Events — SAFE Africa CMS" };

export default async function AdminMediaPage() {
  const posts = await prisma.post.findMany({ orderBy: { publishedAt: "desc" } });
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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Visible</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No news or events yet.
                </td>
              </tr>
            )}
            {posts.map((post) => (
              <tr key={post.id} className="border-b last:border-0">
                <td className="max-w-80 truncate px-4 py-3 font-medium">{post.title}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{post.type.toLowerCase()}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatDate(post.eventDate ?? post.publishedAt)}
                </td>
                <td className="px-4 py-3">{post.published ? "Yes" : "No"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/media/${post.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deletePost.bind(null, post.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
