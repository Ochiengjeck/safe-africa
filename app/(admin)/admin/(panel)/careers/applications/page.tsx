import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { ApplicationRow } from "./application-row";

export const metadata = { title: "Applications — SAFE Africa CMS" };

export default async function ApplicationsInboxPage() {
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { vacancy: { select: { title: true } } },
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Applications inbox</h1>
      <div className="space-y-4">
        {applications.length === 0 && <p className="text-sm text-muted-foreground">No applications yet.</p>}
        {applications.map((application) => (
          <ApplicationRow
            key={application.id}
            application={application}
            vacancyTitle={application.vacancy.title}
            receivedAt={formatDate(application.createdAt)}
          />
        ))}
      </div>
    </div>
  );
}
