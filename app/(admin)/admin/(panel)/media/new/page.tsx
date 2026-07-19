import { PostForm } from "../post-form";

export const metadata = { title: "New Post — SAFE Africa CMS" };

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">New post</h1>
      <PostForm />
    </div>
  );
}
