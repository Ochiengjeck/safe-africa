/**
 * Dynamic application-form field system.
 *
 * An ApplicationForm stores an ordered `FormField[]` (JSON). The public
 * DynamicApplicationForm renders these fields; the server validates a
 * submission against the same definition with `validateAnswers` (a bespoke
 * validator, because the fixed Zod `parseForm` path cannot express a schema
 * that is only known at runtime).
 *
 * Answers are keyed by `field.id`. Inputs on the public form are namespaced
 * with FIELD_PREFIX so a single FormData can carry them alongside meta fields
 * (vacancyId, honeypot, cvUrl).
 */

export const FIELD_TYPES = [
  "section",
  "short_text",
  "long_text",
  "email",
  "phone",
  "url",
  "number",
  "date",
  "select",
  "multiselect",
  "yes_no",
  "consent",
  "file",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: string[]; // select / multiselect
  /** Marks a field whose answer denormalizes onto Application.name/email/phone. */
  map?: "name" | "email" | "phone";
};

export type AnswerValue = string | string[] | boolean;
export type Answers = Record<string, AnswerValue>;

/** Input name for a field in the public form's FormData. */
export const FIELD_PREFIX = "f_";
export function fieldInputName(field: FormField) {
  return field.type === "multiselect" ? `${FIELD_PREFIX}${field.id}[]` : `${FIELD_PREFIX}${field.id}`;
}

/**
 * Fields that collect an answer stored in `answers`. Section headings are
 * display-only; file uploads are handled separately via the CV `cvUrl`.
 */
export function isInputField(field: FormField) {
  return field.type !== "section" && field.type !== "file";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

/**
 * Validates a set of answers against a form definition. Returns fieldErrors
 * keyed by `field.id` so they line up with the rendered inputs.
 */
export function validateAnswers(
  fields: FormField[],
  answers: Answers
): { ok: true } | { ok: false; fieldErrors: Record<string, string[]> } {
  const fieldErrors: Record<string, string[]> = {};
  const add = (id: string, msg: string) => (fieldErrors[id] ??= []).push(msg);

  for (const field of fields) {
    if (!isInputField(field)) continue;
    const value = answers[field.id];
    const empty =
      value === undefined ||
      value === "" ||
      value === false ||
      (Array.isArray(value) && value.length === 0);

    if (field.type === "consent") {
      if (value !== true) add(field.id, "This must be checked to continue.");
      continue;
    }
    if (field.required && empty) {
      add(field.id, "This field is required.");
      continue;
    }
    if (empty) continue;

    if (field.type === "email" && typeof value === "string" && !EMAIL_RE.test(value)) {
      add(field.id, "Enter a valid email address.");
    }
    if (field.type === "url" && typeof value === "string" && !URL_RE.test(value)) {
      add(field.id, "Enter a valid URL (starting with http).");
    }
    if (field.type === "number" && typeof value === "string" && Number.isNaN(Number(value))) {
      add(field.id, "Enter a valid number.");
    }
    if (
      (field.type === "select" || field.type === "yes_no") &&
      typeof value === "string" &&
      field.options &&
      field.options.length > 0 &&
      !field.options.includes(value)
    ) {
      add(field.id, "Choose one of the provided options.");
    }
  }

  return Object.keys(fieldErrors).length ? { ok: false, fieldErrors } : { ok: true };
}

/** Pulls the denormalized contact fields out of the answers via `map`. */
export function extractContact(fields: FormField[], answers: Answers) {
  const pick = (role: "name" | "email" | "phone") => {
    const field = fields.find((f) => f.map === role);
    const value = field ? answers[field.id] : undefined;
    return typeof value === "string" ? value.trim() : "";
  };
  return { name: pick("name"), email: pick("email"), phone: pick("phone") };
}

/** The seeded "Standard Job Application" template. */
export function defaultApplicationFields(): FormField[] {
  return [
    { id: "full_name", type: "short_text", label: "Full name", required: true, map: "name", placeholder: "As it appears on your ID" },
    { id: "email", type: "email", label: "Email address", required: true, map: "email" },
    { id: "phone", type: "phone", label: "Phone number", required: true, map: "phone", helpText: "Include country code, e.g. +254…" },
    { id: "county", type: "short_text", label: "County / City of residence", required: true },
    { id: "highest_qualification", type: "short_text", label: "Highest qualification", required: true, placeholder: "e.g. BSc Agricultural Economics" },
    { id: "field_of_study", type: "short_text", label: "Field of study", required: true },
    {
      id: "degree_class",
      type: "select",
      label: "Class of degree",
      required: true,
      options: ["First Class Honours", "Second Class Honours - Upper Division", "Second Class Honours - Lower Division", "Pass", "Other"],
    },
    {
      id: "data_tools",
      type: "multiselect",
      label: "Data collection tools you have used",
      helpText: "Select all that apply.",
      options: ["ODK", "SurveyCTO", "Survey Solutions", "KoBoToolbox", "None yet"],
    },
    {
      id: "preferred_counties",
      type: "multiselect",
      label: "Preferred county of deployment",
      options: ["Makueni", "Nakuru", "Kirinyaga", "Busia"],
    },
    { id: "full_time_available", type: "yes_no", label: "Available full-time for the entire assignment?", required: true, options: ["Yes", "No"] },
    { id: "local_languages", type: "short_text", label: "Local languages spoken", helpText: "Optional, but an added advantage." },
    { id: "cover_letter", type: "long_text", label: "Motivation / cover letter", required: true, placeholder: "Tell us why you are a good fit (min. 20 characters)." },
    {
      id: "consent",
      type: "consent",
      label: "I confirm the information provided is accurate and consent to SAFE Africa storing it for recruitment purposes.",
      required: true,
    },
  ];
}
