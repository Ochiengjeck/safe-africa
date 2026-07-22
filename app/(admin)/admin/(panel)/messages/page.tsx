import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { MessagesTable } from "./messages-table";

export const metadata = { title: "Messages — SAFE Africa CMS" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Inbox" title="Contact messages" subtitle="Enquiries submitted through the public contact form." />
      <Suspense>
        <MessagesTable messages={messages} />
      </Suspense>
    </div>
  );
}
