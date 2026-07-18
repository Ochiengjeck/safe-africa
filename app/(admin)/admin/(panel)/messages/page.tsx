import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { MessageRow } from "./message-row";

export const metadata = { title: "Messages — SAFE Africa CMS" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Contact messages</h1>
      <div className="space-y-3">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {messages.map((message) => (
          <MessageRow key={message.id} message={message} receivedAt={formatDate(message.createdAt)} />
        ))}
      </div>
    </div>
  );
}
