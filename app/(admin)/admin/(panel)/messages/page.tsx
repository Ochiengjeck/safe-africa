import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { MessagesTable } from "./messages-table";

export const metadata = { title: "Messages — SAFE Africa CMS" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Contact messages</h1>
      <Suspense>
        <MessagesTable messages={messages} />
      </Suspense>
    </div>
  );
}
