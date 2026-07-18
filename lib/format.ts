export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MONTH_YEAR = new Intl.DateTimeFormat("en-KE", { month: "long", year: "numeric" });
const FULL_DATE = new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric" });

/** "September 2025 – February 2026" or "September 2024 – Present" */
export function formatPeriod(start: Date, end: Date | null | undefined) {
  return `${MONTH_YEAR.format(start)} – ${end ? MONTH_YEAR.format(end) : "Present"}`;
}

export function formatDate(date: Date) {
  return FULL_DATE.format(date);
}
