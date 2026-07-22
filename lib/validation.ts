import { z } from "zod";
import { checkbox, optionalDate, orderField } from "@/lib/action-utils";
import { FIELD_TYPES } from "@/lib/careers/form-fields";

const id = z.string().min(1).optional(); // present on update, absent on create

export const thematicAreaSchema = z.object({
  id,
  title: z.string().min(2).max(200),
  tagline: z.string().min(2).max(300),
  description: z.string().min(10),
  impact: z.string().min(10),
  icon: z.string().max(60).optional(),
  coverImage: z.string().url().optional(),
  order: orderField,
});

export const serviceSchema = z.object({
  id,
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  icon: z.string().max(60).optional(),
  image: z.string().url().optional(),
  order: orderField,
});

export const projectSchema = z.object({
  id,
  title: z.string().min(2).max(300),
  client: z.string().min(2).max(300),
  location: z.string().min(2).max(300),
  periodStart: z.coerce.date(),
  periodEnd: optionalDate,
  overview: z.string().min(10),
  role: z.string().min(10),
  scaleResults: z.string().min(10),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: checkbox,
  coverImage: z.string().url().optional(),
  thematicAreaIds: z.array(z.string()).default([]),
});

export const resourceSchema = z.object({
  id,
  title: z.string().min(2).max(300),
  type: z.enum(["PUBLICATION", "REPORT", "POLICY_BRIEF", "TOOLKIT", "RESEARCH"]),
  description: z.string().max(2000).optional(),
  fileUrl: z.string().url(),
  coverImage: z.string().url().optional(),
  thematicAreaId: z.string().optional(),
});

export const vacancySchema = z.object({
  id,
  title: z.string().min(2).max(200),
  type: z.enum(["JOB", "INTERNSHIP"]).default("JOB"),
  location: z.string().min(2).max(200),
  summary: z.string().max(500).optional(),
  deadline: optionalDate,
  description: z.string().min(10),
  status: z.enum(["DRAFT", "OPEN", "CLOSED"]).default("DRAFT"),
  formId: z.string().optional(),
  resumeStrict: checkbox,
  resumeTemplateUrl: z.string().url().optional(),
});

// ——— Application forms (builder) ———

const formFieldSchema = z.object({
  id: z.string().min(1).max(80),
  type: z.enum(FIELD_TYPES),
  label: z.string().min(1).max(300),
  required: z.boolean().optional(),
  helpText: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  options: z.array(z.string().max(200)).optional(),
  map: z.enum(["name", "email", "phone"]).optional(),
});

const fieldsJson = z
  .string()
  .transform((raw, ctx) => {
    try {
      return JSON.parse(raw);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid form fields payload." });
      return z.NEVER;
    }
  })
  .pipe(z.array(formFieldSchema).min(1, "Add at least one field."));

export const applicationFormSchema = z.object({
  id,
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  fields: fieldsJson,
  isTemplate: checkbox,
  requireCv: checkbox,
  resumeStrict: checkbox,
  resumeTemplateUrl: z.string().url().optional(),
});

// ——— Interviews ———

export const interviewSchema = z.object({
  id,
  applicationId: z.string().optional(),
  talentPoolId: z.string().optional(),
  vacancyId: z.string().optional(),
  positionTitle: z.string().min(2).max(300),
  candidateName: z.string().min(2).max(200),
  candidateEmail: z.string().email().max(200),
  scheduledAt: z.coerce.date(),
  mode: z.enum(["VIDEO", "PHONE", "IN_PERSON"]).default("VIDEO"),
  locationOrLink: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

export const postSchema = z.object({
  id,
  type: z.enum(["NEWS", "EVENT"]).default("NEWS"),
  title: z.string().min(2).max(300),
  excerpt: z.string().max(500).optional(),
  body: z.string().min(10),
  coverImage: z.string().url().optional(),
  eventDate: optionalDate,
  eventLocation: z.string().max(300).optional(),
  published: checkbox,
});

export const galleryImageSchema = z.object({
  id,
  url: z.string().url(),
  publicId: z.string().optional(),
  caption: z.string().max(300).optional(),
  category: z.string().max(100).optional(),
  order: orderField,
});

export const teamMemberSchema = z.object({
  id,
  name: z.string().min(2).max(200),
  title: z.string().min(2).max(200),
  bio: z.string().max(3000).optional(),
  photo: z.string().url().optional(),
  order: orderField,
});

export const pageSectionSchema = z.object({
  key: z.string().min(2).max(100),
  content: z.string().refine((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }, "Content must be valid JSON"),
});

export const userSchema = z.object({
  id,
  email: z.string().email().max(200),
  name: z.string().min(2).max(200),
  password: z.string().min(10).max(100).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).default("EDITOR"),
  active: checkbox,
});

export const settingsSchema = z.object({
  address: z.string().min(5).max(500),
  poBox: z.string().max(300).optional(),
  phone: z.string().min(5).max(100),
  email: z.string().email().max(200),
  linkedin: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  twitter: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  facebook: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  mapEmbedUrl: z.string().url().optional(),
});

// ——— Public forms (honeypot field must stay empty) ———

export const contactSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().max(200),
  subject: z.string().max(300).optional(),
  message: z.string().min(10).max(5000),
  website: z.string().max(0).optional(), // honeypot
});

export const applicationSchema = z.object({
  vacancyId: z.string().min(1),
  name: z.string().min(2).max(200),
  email: z.string().email().max(200),
  phone: z.string().min(5).max(50),
  coverLetter: z.string().min(20).max(10000),
  cvUrl: z.string().url().optional(),
  website: z.string().max(0).optional(), // honeypot
});

// ——— Talent pool signup (structured CV; submitted as a JSON payload) ———

const str = (max = 500) => z.string().trim().max(max);
const reqStr = (min = 1, max = 500) => z.string().trim().min(min, "Required").max(max);
const optStr = (max = 2000) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);
const yearStr = z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit year");

const cvReference = z
  .object({
    name: optStr(200),
    role: optStr(200),
    organization: optStr(200),
    email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || undefined),
    phone: optStr(50),
  })
  .partial();

export const talentPoolSchema = z.object({
  // Core personal & contact
  fullName: reqStr(2, 200),
  preferredName: optStr(200),
  nationality: reqStr(2, 120),
  location: reqStr(2, 200),
  primaryPhone: reqStr(5, 50),
  otherPhones: z.array(str(50)).max(5).default([]),
  primaryEmail: z.string().trim().email().max(200),
  otherEmails: z.array(z.string().trim().email().max(200)).max(5).default([]),
  linkedinUrl: z.string().trim().url().max(300).optional().or(z.literal("")).transform((v) => v || undefined),
  // Professional summary
  professionalTitle: reqStr(2, 200),
  profileSummary: reqStr(10, 1000),
  careerObjective: optStr(1000),
  // Skills
  primarySpecializations: z.array(str(120)).min(1, "Add at least one specialization").max(30),
  technicalSkills: z.array(str(120)).max(50).default([]),
  researchInterests: optStr(1000),
  // Repeatable blocks
  education: z
    .array(
      z.object({
        institution: reqStr(2, 200),
        qualification: reqStr(2, 200),
        startYear: yearStr,
        endYear: yearStr,
        description: optStr(600),
        certificateName: optStr(200),
        certificateDate: optStr(60),
      })
    )
    .max(20)
    .default([]),
  memberships: z
    .array(
      z.object({
        organization: reqStr(2, 200),
        membershipType: optStr(200),
        registrationNumber: optStr(120),
        startDate: optStr(60),
      })
    )
    .max(20)
    .default([]),
  employmentHistory: z
    .array(
      z.object({
        startDate: reqStr(4, 60),
        endDate: reqStr(4, 60),
        employer: reqStr(2, 200),
        position: reqStr(2, 200),
        location: optStr(200),
        responsibilities: reqStr(5, 2000),
        reference: cvReference.optional(),
      })
    )
    .max(30)
    .default([]),
  projects: z
    .array(
      z.object({
        year: yearStr,
        client: reqStr(2, 200),
        role: reqStr(2, 200),
        projectTitle: reqStr(2, 300),
        summary: reqStr(5, 2000),
        reference: cvReference.optional(),
      })
    )
    .max(40)
    .default([]),
  researchAndPublications: z
    .array(
      z.object({
        title: reqStr(2, 300),
        partners: optStr(300),
        abstractOrRole: optStr(1000),
        link: z.string().trim().url().max(400).optional().or(z.literal("")).transform((v) => v || undefined),
      })
    )
    .max(40)
    .default([]),
  references: z
    .array(
      z.object({
        name: reqStr(2, 200),
        position: optStr(200),
        organization: optStr(200),
        phone: optStr(50),
        email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || undefined),
        relationship: optStr(200),
      })
    )
    .max(20)
    .default([]),
  // Declaration & privacy
  digitalSignature: reqStr(2, 200),
  dateSigned: reqStr(4, 40),
  declarationSigned: z.literal(true, { message: "You must confirm the declaration." }),
  privacyConsent: z.literal(true, { message: "Consent is required to join the talent pool." }),
  dataRetentionPeriod: z.enum(["6 months", "1 year", "2 years", "Indefinite"]).default("1 year"),
  website: z.string().max(0).optional(), // honeypot
});

export type TalentPoolInput = z.infer<typeof talentPoolSchema>;
