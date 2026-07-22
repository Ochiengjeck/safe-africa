-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('VIDEO', 'PHONE', 'IN_PERSON');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'PASSED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('NONE', 'SENT', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "TalentStatus" AS ENUM ('ACTIVE', 'INVITED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "answers" JSONB,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "notifiedStatuses" "ApplicationStatus"[] DEFAULT ARRAY[]::"ApplicationStatus"[],
ALTER COLUMN "coverLetter" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Vacancy" ADD COLUMN     "formId" TEXT,
ADD COLUMN     "notifiedTalentPool" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resumeStrict" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resumeTemplateUrl" TEXT,
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "ApplicationForm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "requireCv" BOOLEAN NOT NULL DEFAULT true,
    "resumeStrict" BOOLEAN NOT NULL DEFAULT false,
    "resumeTemplateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT,
    "talentPoolId" TEXT,
    "vacancyId" TEXT,
    "positionTitle" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "mode" "InterviewMode" NOT NULL DEFAULT 'VIDEO',
    "locationOrLink" TEXT,
    "notes" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "offerStatus" "OfferStatus" NOT NULL DEFAULT 'NONE',
    "offerSentAt" TIMESTAMP(3),
    "offerNotes" TEXT,
    "notifiedScheduled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TalentPoolEntry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" TEXT,
    "nationality" TEXT,
    "data" JSONB NOT NULL,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "retention" TEXT,
    "status" "TalentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TalentPoolEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TalentPoolEntry_email_key" ON "TalentPoolEntry"("email");

-- CreateIndex
CREATE INDEX "TalentPoolEntry_status_idx" ON "TalentPoolEntry"("status");

-- CreateIndex
CREATE INDEX "Application_vacancyId_status_idx" ON "Application"("vacancyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_vacancyId_email_key" ON "Application"("vacancyId", "email");

-- AddForeignKey
ALTER TABLE "Vacancy" ADD CONSTRAINT "Vacancy_formId_fkey" FOREIGN KEY ("formId") REFERENCES "ApplicationForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_talentPoolId_fkey" FOREIGN KEY ("talentPoolId") REFERENCES "TalentPoolEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "Vacancy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
