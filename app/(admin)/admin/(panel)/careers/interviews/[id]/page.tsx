import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RecordMeta } from "@/components/admin/record-meta";
import { InterviewForm, type InterviewInitial } from "../interview-form";

export const metadata = { title: "Edit Interview — SAFE Africa CMS" };

export default async function EditInterviewPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [interview, vacancies] = await Promise.all([
    prisma.interview.findFirst({ where: { id, deletedAt: null } }),
    prisma.vacancy.findMany({ where: { deletedAt: null, status: "OPEN" }, orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
  ]);
  if (!interview) notFound();

  const initial: InterviewInitial = {
    id: interview.id,
    applicationId: interview.applicationId,
    talentPoolId: interview.talentPoolId,
    vacancyId: interview.vacancyId,
    positionTitle: interview.positionTitle,
    candidateName: interview.candidateName,
    candidateEmail: interview.candidateEmail,
    scheduledAt: interview.scheduledAt.toISOString().slice(0, 16),
    mode: interview.mode,
    locationOrLink: interview.locationOrLink,
    notes: interview.notes,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Edit interview</h1>
        <RecordMeta createdAt={interview.createdAt} updatedAt={interview.updatedAt} />
      </div>
      <InterviewForm initial={initial} vacancies={vacancies} />
    </div>
  );
}
