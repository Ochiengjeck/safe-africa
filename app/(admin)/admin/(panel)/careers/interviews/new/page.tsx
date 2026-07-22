import { prisma } from "@/lib/prisma";
import { InterviewForm, type InterviewInitial } from "../interview-form";

export const metadata = { title: "Schedule Interview — SAFE Africa CMS" };

export default async function NewInterviewPage(props: {
  searchParams: Promise<{ applicationId?: string; talentPoolId?: string; vacancyId?: string }>;
}) {
  const { applicationId, talentPoolId, vacancyId } = await props.searchParams;

  const vacancies = await prisma.vacancy.findMany({
    where: { deletedAt: null, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  const initial: InterviewInitial = { vacancyId: vacancyId ?? null };

  if (applicationId) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { vacancy: { select: { id: true, title: true } } },
    });
    if (app) {
      initial.applicationId = app.id;
      initial.candidateName = app.name;
      initial.candidateEmail = app.email;
      initial.vacancyId = app.vacancy.id;
      initial.positionTitle = app.vacancy.title;
    }
  } else if (talentPoolId) {
    const entry = await prisma.talentPoolEntry.findUnique({ where: { id: talentPoolId } });
    if (entry) {
      initial.talentPoolId = entry.id;
      initial.candidateName = entry.fullName;
      initial.candidateEmail = entry.email;
      initial.positionTitle = entry.professionalTitle;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Schedule interview</h1>
      <InterviewForm initial={initial} vacancies={vacancies} />
    </div>
  );
}
