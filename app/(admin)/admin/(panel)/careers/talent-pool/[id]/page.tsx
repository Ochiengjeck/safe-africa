import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CvPreview } from "@/components/careers/cv-preview";
import type { TalentPoolInput } from "@/lib/validation";

export const metadata = { title: "Talent Profile — SAFE Africa CMS" };

export default async function TalentProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const entry = await prisma.talentPoolEntry.findFirst({ where: { id, deletedAt: null } });
  if (!entry) notFound();

  const data = entry.data as unknown as TalentPoolInput;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/admin/careers/talent-pool" className="text-sm font-medium text-primary hover:underline">
            ← Talent pool
          </Link>
          <Badge variant="outline">{entry.status.toLowerCase()}</Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={`mailto:${entry.email}`}>Email</a>
          </Button>
          <Button asChild>
            <Link href={`/admin/careers/interviews/new?talentPoolId=${entry.id}`}>Invite to interview</Link>
          </Button>
        </div>
      </div>

      <CvPreview data={data} />
    </div>
  );
}
