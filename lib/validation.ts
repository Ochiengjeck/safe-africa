import { z } from "zod";
import { checkbox, optionalDate, orderField } from "@/lib/action-utils";

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
  deadline: optionalDate,
  description: z.string().min(10),
  status: z.enum(["OPEN", "CLOSED"]).default("OPEN"),
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
