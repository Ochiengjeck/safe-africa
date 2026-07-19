"use client";

import Link from "next/link";
import { DataTable, type Column } from "@/components/admin/data-table";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePost } from "@/lib/actions/posts";
import { restoreItem } from "@/lib/actions/trash";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/generated/prisma/client";

const columns: Column<Post>[] = [
  { key: "title", header: "Title", value: (p) => p.title, cell: (p) => <span className="block max-w-80 truncate font-medium">{p.title}</span> },
  {
    key: "type",
    header: "Type",
    value: (p) => p.type,
    cell: (p) => <Badge variant="secondary">{p.type.toLowerCase()}</Badge>,
  },
  {
    key: "date",
    header: "Date",
    value: (p) => p.eventDate ?? p.publishedAt,
    cell: (p) => <span className="whitespace-nowrap font-mono text-xs">{formatDate(p.eventDate ?? p.publishedAt)}</span>,
  },
  { key: "visible", header: "Visible", value: (p) => (p.published ? "Yes" : "No") },
];

export function PostsTable({ posts }: { posts: Post[] }) {
  return (
    <DataTable
      rows={posts}
      columns={columns}
      rowKey={(p) => p.id}
      rowHref={(p) => `/admin/media/${p.id}`}
      defaultSort={{ key: "date", dir: "desc" }}
      searchPlaceholder="Search title…"
      emptyMessage="No news or events yet."
      actions={(p) => (
        <>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/media/${p.id}`}>Edit</Link>
          </Button>
          <DeleteButton
            action={deletePost.bind(null, p.id)}
            restore={restoreItem.bind(null, "post", p.id)}
            resourceLabel={`${p.type === "NEWS" ? "news post" : "event"} “${p.title}”`}
          />
        </>
      )}
    />
  );
}
