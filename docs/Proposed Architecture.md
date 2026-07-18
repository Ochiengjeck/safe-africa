# SAFE Africa Website — Proposed Architecture

**Smart Agriculture and Food Economics Africa Ltd (SAFE Africa Ltd)** is a Kenya-registered research, evaluation, and advisory firm. This document describes the architecture for its new website: a single **Next.js 16 (App Router)** codebase that serves both the **public website** and a **custom admin CMS** at `/admin`. All content (thematic areas, projects, services, resources, vacancies, news/events, page copy) lives in a **Neon Postgres** database accessed through **Prisma**, so administrators can update the site without developer involvement or redeploys. Media and documents are stored on **Cloudinary**; the app deploys to **Vercel**. This supersedes the current Laravel/Livewire site at safeafrika.com (Home, About Us, Projects, Careers, Contact), all of whose content carries over.

## 1. Tech Stack

| Layer | Technology | Notes |
| ----- | ----- | ----- |
| Framework | Next.js 16 (App Router) | Already scaffolded in this repo (`next` 16.2.10). ⚠ Breaking changes vs 15 — consult `node_modules/next/dist/docs/` (e.g. `middleware.ts` is now `proxy.ts`) |
| Language | TypeScript (strict) | `@/*` path alias to repo root |
| Styling | Tailwind CSS v4 | CSS-first config via `@theme` in `app/globals.css` — no `tailwind.config` file |
| UI components | shadcn/ui | Admin tables, dialogs, forms; reused primitives on the public site |
| Database | Neon (serverless Postgres) | Branching for dev/preview environments; pairs with Vercel |
| ORM | Prisma | Schema as source of truth, migrations checked in |
| Authentication | Auth.js v5 | Credentials provider for admin users only; JWT sessions; no public sign-up |
| Forms & validation | React Hook Form + Zod | Zod schemas shared between client forms and server actions |
| Media & documents | Cloudinary | Images with on-the-fly transformations; raw uploads for PDFs/reports/CVs |
| Rich text | Tiptap | Content stored as JSON in Postgres, rendered server-side on public pages |
| Email | Resend | Notifications to info@safeafrika.com for contact messages and job applications |
| Deployment | Vercel | Preview deployments per branch; Neon branch per preview |

## 2. Application Architecture

One Next.js app, two route groups — public site and admin CMS:

```
app/
├── (public)/                        Public website — Server Components, cached (ISR)
│   ├── layout.tsx                   Header, nav, footer (contact info from SiteSetting)
│   ├── page.tsx                     Home: hero, thematic areas, impact stats, featured
│   │                                projects, client segments, call-to-action
│   ├── about/page.tsx               Overview, mission & vision, values, geographic
│   │                                footprint, approach, team
│   ├── thematic-areas/[slug]/       6 areas: agriculture-food-nutrition-systems,
│   │                                girls-womens-empowerment, youth-skills-workforce,
│   │                                climate-change-nrm, wash, social-protection
│   ├── services/page.tsx            12 specializations (baseline & endline surveys,
│   │                                impact assessments, RCTs, feasibility studies,
│   │                                agri-enterprise financial advisory, food & nutrition
│   │                                security, livelihood analysis, WASH, gender & social
│   │                                inclusion, CSA & NRM, data analytics, regional expertise)
│   ├── projects/
│   │   ├── page.tsx                 Listing with thematic-area filter
│   │   └── [slug]/page.tsx          Client, location, period, overview, SAFE Africa's
│   │                                role, scale & results, image gallery, attached reports
│   ├── resources/page.tsx           Publications, reports, policy briefs, toolkits (PDF downloads)
│   ├── careers/
│   │   ├── page.tsx                 Open vacancies & internships ("no open positions" empty state)
│   │   └── [slug]/page.tsx          Vacancy detail + application form with CV upload
│   ├── media-events/page.tsx        News, events, photo gallery
│   └── contact/page.tsx             Contact form, office address, map embed, socials
│
├── (admin)/admin/                   Custom CMS — protected by proxy.ts + Auth.js
│   ├── login/page.tsx
│   ├── page.tsx                     Dashboard: unread messages, new applications, content stats
│   ├── projects/                    CRUD, publish/archive, images, report attachments
│   ├── thematic-areas/              Edit the 6 areas (tagline, description, impact copy)
│   ├── services/                    CRUD with icons, descriptions, ordering
│   ├── resources/                   Upload/manage PDFs, publications, policy briefs
│   ├── careers/                     Vacancies CRUD + applications inbox (CV download,
│   │                                status: new → reviewed → shortlisted/rejected)
│   ├── media/                       News, events, photo gallery
│   ├── team/                        Team member profiles
│   ├── pages/                       Editable home/about sections (hero, stats, CTA, mission…)
│   ├── messages/                    Contact form submissions
│   ├── users/                       Admin accounts & roles (SUPER_ADMIN only)
│   └── settings/                    Address, phones, emails, social links, map, impact numbers
│
├── api/
│   ├── auth/[...nextauth]/          Auth.js handlers
│   └── uploads/sign/                Issues Cloudinary signed-upload params
├── sitemap.ts / robots.ts           Generated from published slugs in the DB
└── opengraph-image.tsx              Branded OG image (per-page variants for projects/posts)

proxy.ts                             Root-level (Next 16 rename of middleware.ts):
                                     redirects unauthenticated /admin/* requests to login
prisma/schema.prisma + seed.ts       Schema, migrations, seed from the company profile
lib/                                 prisma client, auth config, cloudinary, zod schemas, mailer
```

### Key patterns

- **Reads:** Public pages are Server Components querying Prisma directly — no REST layer between the site and its own database.
- **Writes:** All mutations (admin CRUD, contact form, job applications) are **Server Actions** validated with Zod at the boundary.
- **Publishing without redeploys:** Public pages are statically cached; after an admin edit, the server action calls `revalidatePath`/`revalidateTag` so changes appear immediately while the site stays fast and cheap to serve.
- **Uploads:** Browser uploads go directly to Cloudinary using short-lived signed parameters from `api/uploads/sign` (files never pass through the Next.js server); the database stores the Cloudinary `publicId` + secure URL.
- **Access control:** `proxy.ts` gates all `/admin` routes; every server action re-checks the session and role (defense in depth, since proxy alone is not sufficient).
- **Roles:**
  - `SUPER_ADMIN` — everything, including admin user management and site settings
  - `ADMIN` — all content plus careers/applications and contact messages (covers HR duties)
  - `EDITOR` — content only (projects, resources, media, pages); no users, settings, or applicant data

## 3. Data Model (Prisma)

| Model | Key fields |
| ----- | ----- |
| `User` | email, passwordHash, name, role (`SUPER_ADMIN` / `ADMIN` / `EDITOR`), active |
| `ThematicArea` | slug, title, tagline, description (rich text), impact (rich text), icon, coverImage, order |
| `Service` | slug, title, description, icon, image, order |
| `Project` | slug, title, client, location, periodStart, periodEnd, overview, role ("SAFE Africa's Role"), scaleResults, status (`DRAFT` / `PUBLISHED` / `ARCHIVED`), featured, thematicAreas (m-n), images[], attachments[] (reports/PDFs) |
| `Resource` | title, type (`PUBLICATION` / `REPORT` / `POLICY_BRIEF` / `TOOLKIT` / `RESEARCH`), description, fileUrl, coverImage, thematicArea?, publishedAt |
| `Vacancy` | slug, title, type (`JOB` / `INTERNSHIP`), location, deadline, description (rich text), status (`OPEN` / `CLOSED`) |
| `Application` | vacancy →, name, email, phone, coverLetter, cvUrl, status (`NEW` / `REVIEWED` / `SHORTLISTED` / `REJECTED`) |
| `Post` | type (`NEWS` / `EVENT`), slug, title, body (rich text), coverImage, eventDate?, eventLocation?, publishedAt |
| `GalleryImage` | url, caption, category, order |
| `TeamMember` | name, title, bio, photo, order |
| `PageSection` | key (e.g. `home.hero`, `home.stats`, `about.mission`), content (JSON) — makes homepage/about copy editable without a page builder |
| `ContactMessage` | name, email, subject, message, read |
| `SiteSetting` | singleton: address, phone, email, social links, map embed URL, impact numbers (counties, households reached, …) |

The project fields mirror the structure already used in the company profile (Client / Location / Period / Project Overview / SAFE Africa's Role / Scale and Results), so the five featured assignments (KJADE baseline & listing for World Bank/IFPRI, Habitat for Humanity Machakos feasibility study, CIFOR-ICRAF Restore Africa baseline, Syngenta seed systems study) can be seeded verbatim.

## 4. Cross-Cutting Concerns

- **SEO:** per-page Metadata API, dynamic OG images, `sitemap.ts` built from published DB slugs, JSON-LD `Organization` markup, canonical URLs on safeafrika.com.
- **Security:** Zod validation on every server action; rate limiting + honeypot fields on the public contact and application forms; CV/PDF uploads restricted by MIME type and size; hashed passwords (bcrypt/argon2); applicant data visible only to `ADMIN`+.
- **Email:** Resend sends notifications for new contact messages and job applications; templates kept in `lib/email/`.
- **Accessibility & i18n:** English-only at launch; semantic HTML, keyboard-navigable admin, WCAG AA contrast (site already ships light/dark tokens in `globals.css`).

## 5. Implementation Phases

1. **Foundation** — Prisma schema + Neon connection, Auth.js credentials login, admin shell (layout, nav, roles), seed script populating thematic areas, services, and the five featured projects from `docs/SAFE Africa profile.md`.
2. **Core content modules** — projects, thematic areas, and services: admin CRUD + public listing/detail pages with revalidation.
3. **Remaining modules** — resources, careers + applications inbox, media & events, team, editable page sections, site settings.
4. **Public polish** — homepage assembly, SEO/OG/sitemap, contact + application forms with Cloudinary uploads and Resend notifications.
5. **Launch** — Vercel production deploy, environment/secrets setup, domain cutover from the current Laravel site, redirects for legacy URLs (`/about-us` → `/about`, `/contact-us` → `/contact`).
