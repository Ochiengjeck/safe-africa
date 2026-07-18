import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PostForm } from "../post-form";

export const metadata = { title: "Edit Post — SAFE Africa CMS" };

export default async function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit post</h1>
      <PostForm post={post} />
    </div>
  );
}
