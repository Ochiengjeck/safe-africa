import { prisma } from "@/lib/prisma";
import { InterviewForm, type InterviewInitial } from "../interview-form";

export const metadata = { title: "Schedule Interview — SAFE Africa CMS" };

export default async function NewInterviewPage(props: {
  searchParams: Promise<{ applicationId?: string; talentPoolId?: string; vacancyId?: string }>;
}) {
  const { applicationId, talentPoolId, vacancyId } = await props.searchParams;

  const [vacancies, applicantRows, talentRows] = await Promise.all([
    prisma.vacancy.findMany({ where: { deletedAt: null, status: "OPEN" }, orderBy: { createdAt: "desc" }, select: { id: true, title: true } }),
    prisma.application.findMany({
      where: { deletedAt: null, status: { in: ["SHORTLISTED", "REVIEWED", "NEW"] } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, email: true, vacancy: { select: { id: true, title: true } } },
      take: 200,
    }),
    prisma.talentPoolEntry.findMany({
      where: { deletedAt: null, status: { in: ["ACTIVE", "INVITED"] } },
      orderBy: { fullName: "asc" },
      select: { id: true, fullName: true, email: true, professionalTitle: true },
      take: 200,
    }),
  ]);

  const applicants = applicantRows.map((a) => ({ id: a.id, name: a.name, email: a.email, vacancyId: a.vacancy.id, vacancyTitle: a.vacancy.title }));
  const talent = talentRows.map((t) => ({ id: t.id, name: t.fullName, email: t.email, title: t.professionalTitle }));

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
      <InterviewForm initial={initial} vacancies={vacancies} applicants={applicants} talent={talent} />
    </div>
  );
}
