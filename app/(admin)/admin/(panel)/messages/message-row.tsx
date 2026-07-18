"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleMessageRead, deleteMessage } from "@/lib/actions/messages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ContactMessage } from "@/lib/generated/prisma/client";

export function MessageRow({ message, receivedAt }: { message: ContactMessage; receivedAt: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Card className={message.read ? "opacity-80" : ""}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">
            {message.subject ?? "(no subject)"} {!message.read && <Badge>new</Badge>}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {message.name} · <a href={`mailto:${message.email}`} className="underline">{message.email}</a> · {receivedAt}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await toggleMessageRead(message.id, !message.read);
                router.refresh();
              })
            }
          >
            Mark {message.read ? "unread" : "read"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Delete this message?")) return;
              startTransition(async () => {
                await deleteMessage(message.id);
                router.refresh();
              });
            }}
          >
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm">{message.message}</p>
      </CardContent>
    </Card>
  );
}
