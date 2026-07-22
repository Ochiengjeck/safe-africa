"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { interviewSchema } from "@/lib/validation";
import { parseForm, type ActionState } from "@/lib/action-utils";
import { interviewScheduled, offerSent } from "@/lib/email/templates";
import { sendMail } from "@/lib/email";
import type { InterviewMode, InterviewStatus, OfferStatus } from "@/lib/generated/prisma/client";

const MODE_LABEL: Record<InterviewMode, string> = {
  VIDEO: "Video call",
  PHONE: "Phone call",
  IN_PERSON: "In person",
};

function whenText(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  }).format(date);
}

async function notifyScheduled(row: {
  candidateName: string;
  candidateEmail: string;
  positionTitle: string;
  scheduledAt: Date;
  mode: InterviewMode;
  locationOrLink: string | null;
  notes: string | null;
}) {
  const { subject, html } = interviewScheduled({
    name: row.candidateName,
    position: row.positionTitle,
    whenText: whenText(row.scheduledAt),
    mode: MODE_LABEL[row.mode],
    locationOrLink: row.locationOrLink,
    notes: row.notes,
  });
  await sendMail(row.candidateEmail, subject, html);
}

export async function scheduleInterview(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = parseForm(interviewSchema, formData);
  if (!parsed.ok) return parsed.state;
  const { id, applicationId, talentPoolId, vacancyId, ...data } = parsed.data;

  const relations = {
    applicationId: applicationId || null,
    talentPoolId: talentPoolId || null,
    vacancyId: vacancyId || null,
  };

  if (id) {
    const existing = await prisma.interview.findUnique({ where: { id } });
    const updated = await prisma.interview.update({
      where: { id },
      data: { ...data, ...relations, locationOrLink: data.locationOrLink ?? null, notes: data.notes ?? null },
    });
    // Re-notify if the time changed.
    if (existing && existing.scheduledAt.getTime() !== updated.scheduledAt.getTime()) {
      await notifyScheduled(updated);
    }
  } else {
    const created = await prisma.interview.create({
      data: {
        ...data,
        ...relations,
        locationOrLink: data.locationOrLink ?? null,
        notes: data.notes ?? null,
        notifiedScheduled: true,
      },
    });
    await notifyScheduled(created);
    if (relations.talentPoolId) {
      await prisma.talentPoolEntry.update({ where: { id: relations.talentPoolId }, data: { status: "INVITED" } });
    }
  }

  revalidatePath("/admin/careers/interviews");
  redirect("/admin/careers/interviews?saved=Interview+scheduled");
}

/**
 * Creates draft interviews for several applicants at once (from a bulk action).
 * No email is sent — the placeholder time is a reminder to set the real slot in
 * the interview editor, which notifies the candidate when the time is set.
 */
export async function bulkCreateInterviews(applicationIds: string[]) {
  await requireRole("ADMIN");
  if (applicationIds.length === 0) return;

  const apps = await prisma.application.findMany({
    where: { id: { in: applicationIds }, deletedAt: null },
    include: { vacancy: { select: { id: true, title: true } } },
  });

  const placeholder = new Date(Date.now() + 7 * 24 * 3600 * 1000);
  placeholder.setMinutes(0, 0, 0);

  await prisma.interview.createMany({
    data: apps.map((a) => ({
      applicationId: a.id,
      vacancyId: a.vacancy.id,
      positionTitle: a.vacancy.title,
      candidateName: a.name,
      candidateEmail: a.email,
      scheduledAt: placeholder,
      mode: "VIDEO" as InterviewMode,
      status: "SCHEDULED" as InterviewStatus,
      notifiedScheduled: false,
    })),
  });

  revalidatePath("/admin/careers/interviews");
}

export async function setInterviewOutcome(id: string, status: InterviewStatus) {
  await requireRole("ADMIN");
  await prisma.interview.update({ where: { id }, data: { status } });
  revalidatePath("/admin/careers/interviews");
}

export async function sendOffer(id: string, notes?: string) {
  await requireRole("ADMIN");
  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview) return;

  const alreadySent = interview.offerStatus === "SENT" || interview.offerStatus === "ACCEPTED";
  await prisma.interview.update({
    where: { id },
    data: { offerStatus: "SENT", offerSentAt: new Date(), offerNotes: notes?.trim() || interview.offerNotes },
  });

  if (!alreadySent) {
    const { subject, html } = offerSent(interview.candidateName, interview.positionTitle, notes?.trim());
    await sendMail(interview.candidateEmail, subject, html);
  }
  revalidatePath("/admin/careers/interviews");
}

export async function updateOfferStatus(id: string, offerStatus: OfferStatus) {
  await requireRole("ADMIN");
  await prisma.interview.update({ where: { id }, data: { offerStatus } });
  revalidatePath("/admin/careers/interviews");
}

export async function deleteInterview(id: string) {
  await requireRole("ADMIN");
  await prisma.interview.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/careers/interviews");
}
