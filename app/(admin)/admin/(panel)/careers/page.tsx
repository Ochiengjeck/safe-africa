import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteVacancy } from "@/lib/actions/careers";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Careers — SAFE Africa CMS" };

export default async function AdminCareersPage() {
  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Careers</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/careers/applications">Applications inbox</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/careers/new">New vacancy</Link>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Deadline</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Applications</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vacancies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No vacancies yet.
                </td>
              </tr>
            )}
            {vacancies.map((vacancy) => (
              <tr key={vacancy.id} className="border-b last:border-0">
                <td className="max-w-72 truncate px-4 py-3 font-medium">{vacancy.title}</td>
                <td className="px-4 py-3">{vacancy.type === "JOB" ? "Job" : "Internship"}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {vacancy.deadline ? formatDate(vacancy.deadline) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={vacancy.status === "OPEN" ? "default" : "outline"}>
                    {vacancy.status.toLowerCase()}
                  </Badge>
                </td>
                <td className="px-4 py-3">{vacancy._count.applications}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/careers/${vacancy.id}`}>Edit</Link>
                    </Button>
                    <DeleteButton action={deleteVacancy.bind(null, vacancy.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
