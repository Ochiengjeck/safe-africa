"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/admin/data-table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  toggleMessageRead,
  deleteMessage,
  restoreMessage,
  setManyMessagesRead,
  deleteManyMessages,
} from "@/lib/actions/messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { ContactMessage } from "@/lib/generated/prisma/client";

const columns: Column<ContactMessage>[] = [
  {
    key: "from",
    header: "From",
    value: (m) => `${m.name} ${m.email}`,
    cell: (m) => (
      <span className="block">
        <span className="flex items-center gap-2 font-medium">
          {m.name} {!m.read && <Badge>new</Badge>}
        </span>
        <span className="text-xs text-muted-foreground">{m.email}</span>
      </span>
    ),
  },
  {
    key: "subject",
    header: "Subject",
    value: (m) => m.subject ?? "",
    cell: (m) => <span className="block max-w-56 truncate">{m.subject ?? "(no subject)"}</span>,
  },
  {
    key: "message",
    header: "Message",
    value: (m) => m.message,
    sortable: false,
    cell: (m) => <span className="block max-w-96 truncate text-muted-foreground">{m.message}</span>,
    hideOnMobile: true,
  },
  {
    key: "received",
    header: "Received",
    value: (m) => m.createdAt,
    cell: (m) => <span className="whitespace-nowrap font-mono text-xs">{formatDate(m.createdAt)}</span>,
  },
];

export function MessagesTable({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bulkDelete, setBulkDelete] = useState<{ ids: string[]; clear: () => void } | null>(null);
  const [openMessage, setOpenMessage] = useState<ContactMessage | null>(null);

  return (
    <>
      <DataTable
        rows={messages}
        columns={columns}
        rowKey={(m) => m.id}
        defaultSort={{ key: "received", dir: "desc" }}
        searchPlaceholder="Search name, email, subject…"
        emptyMessage="No messages yet — contact form submissions land here."
        rowClassName={(m) => (m.read ? "opacity-70" : undefined)}
        rowHref={undefined}
        actions={(m) => (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOpenMessage(m);
                if (!m.read) {
                  startTransition(async () => {
                    await toggleMessageRead(m.id, true);
                    router.refresh();
                  });
                }
              }}
            >
              Read
            </Button>
            <DeleteButton
              action={deleteMessage.bind(null, m.id)}
              restore={restoreMessage.bind(null, m.id)}
              resourceLabel={`message from ${m.name}`}
            />
          </>
        )}
        bulkActions={(ids, clear) => (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setManyMessagesRead(ids, true);
                  clear();
                  router.refresh();
                  toast.success(`Marked ${ids.length} message(s) read`);
                })
              }
            >
              Mark read
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setManyMessagesRead(ids, false);
                  clear();
                  router.refresh();
                  toast.success(`Marked ${ids.length} message(s) unread`);
                })
              }
            >
              Mark unread
            </Button>
            <Button variant="destructive" size="sm" disabled={pending} onClick={() => setBulkDelete({ ids, clear })}>
              Delete
            </Button>
          </div>
        )}
      />

      <ConfirmDialog
        open={bulkDelete !== null}
        pending={pending}
        title={`Delete ${bulkDelete?.ids.length} message(s)?`}
        description="They move to Trash and can be restored."
        onCancel={() => setBulkDelete(null)}
        onConfirm={() => {
          if (!bulkDelete) return;
          startTransition(async () => {
            await deleteManyMessages(bulkDelete.ids);
            bulkDelete.clear();
            setBulkDelete(null);
            router.refresh();
            toast.success(`Deleted ${bulkDelete.ids.length} message(s)`);
          });
        }}
      />

      {/* Reading pane */}
      {openMessage && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenMessage(null)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Message from ${openMessage.name}`}
            className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background p-6 shadow-xl"
          >
            <h2 className="font-display text-lg font-semibold">{openMessage.subject ?? "(no subject)"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {openMessage.name} ·{" "}
              <a href={`mailto:${openMessage.email}`} className="underline">
                {openMessage.email}
              </a>{" "}
              · {formatDate(openMessage.createdAt)}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm">{openMessage.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${openMessage.email}?subject=Re: ${encodeURIComponent(openMessage.subject ?? "your message")}`}>
                  Reply by email
                </a>
              </Button>
              <Button size="sm" onClick={() => setOpenMessage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
