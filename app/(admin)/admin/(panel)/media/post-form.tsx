"use client";

import Link from "next/link";
import { useActionState } from "react";
import { savePost } from "@/lib/actions/posts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormError } from "@/components/admin/field";
import { SubmitButton } from "@/components/admin/submit-button";
import { RichTextEditor } from "@/components/rich-text/editor";
import { UploadField } from "@/components/upload-field";
import type { Post } from "@/lib/generated/prisma/client";

export function PostForm({ post }: { post?: Post }) {
  const [state, action] = useActionState(savePost, null);
  return (
    <form action={action} className="max-w-3xl space-y-5">
      {post && <input type="hidden" name="id" value={post.id} />}
      <FormError state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type" name="type" state={state}>
          <select
            id="type"
            name="type"
            defaultValue={post?.type ?? "NEWS"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="NEWS">News</option>
            <option value="EVENT">Event</option>
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm font-medium">
          <input
            type="checkbox"
            name="published"
            defaultChecked={post?.published ?? true}
            className="h-4 w-4 rounded border-input"
          />
          Visible on the website
        </label>
      </div>
      <Field label="Title" name="title" state={state}>
        <Input id="title" name="title" defaultValue={post?.title} required />
      </Field>
      <Field label="Excerpt (short summary)" name="excerpt" state={state}>
        <Textarea id="excerpt" name="excerpt" rows={2} defaultValue={post?.excerpt ?? ""} />
      </Field>
      <Field label="Body" name="body" state={state}>
        <RichTextEditor name="body" defaultValue={post?.body} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Event date (events only)" name="eventDate" state={state}>
          <Input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={post?.eventDate ? post.eventDate.toISOString().slice(0, 10) : ""}
          />
        </Field>
        <Field label="Event location" name="eventLocation" state={state}>
          <Input id="eventLocation" name="eventLocation" defaultValue={post?.eventLocation ?? ""} />
        </Field>
      </div>
      <UploadField
        name="coverImage"
        folder="safe-africa/gallery"
        label="Cover image"
        accept="image/*"
        defaultUrl={post?.coverImage ?? undefined}
      />
      <div className="flex items-center gap-3">
        <SubmitButton>{post ? "Save changes" : "Create post"}</SubmitButton>
        <Link href="/admin/media" className="text-sm font-medium text-muted-foreground hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
