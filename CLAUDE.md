# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

- `npm run dev` — dev server at http://localhost:3000 (check the port is free; stale Next servers linger)
- `npm run build` — production build (Turbopack; also type-checks)
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config; `next lint` no longer exists in Next 16)
- `npm run db:migrate` — Prisma migrate dev against Neon (uses `DIRECT_URL`)
- `npm run db:seed` — seed company-profile content + super-admin (idempotent upserts)
- `npx prisma generate` — regenerate the client into `lib/generated/prisma/` (gitignored)

There is no test framework configured. Copy `.env.example` to `.env.local` before anything; Cloudinary/Resend keys are optional (features degrade gracefully).

## Architecture

Full-stack site for SAFE Africa Ltd (research/evaluation consultancy): public website + custom admin CMS in one Next.js 16 App Router codebase. `docs/Proposed Architecture.md` is the authoritative design; `docs/SAFE Africa profile.md` is the content source used by `prisma/seed.ts`.

- **Route groups**: `app/(public)/` (ISR pages, `export const revalidate`) and `app/(admin)/admin/` — login page outside, everything else under `(panel)/` whose layout enforces auth. `proxy.ts` (Next 16's rename of middleware) does a cookie-presence redirect for `/admin/*`.
- **Data flow**: Server Components query Prisma directly; all writes are server actions in `lib/actions/*` following one pattern: `requireRole()` → `parseForm(schema, formData)` (Zod, in `lib/validation.ts`) → Prisma → `revalidatePublic()` (revalidates the whole public tree — intentional, the site is small). Admin forms are `useActionState` + the `Field`/`FormError` helpers in `components/admin/field.tsx`.
- **Auth**: Auth.js v5 credentials + JWT in `lib/auth.ts`; roles EDITOR < ADMIN < SUPER_ADMIN ranked in `lib/authz.ts`. Server actions MUST call `requireRole` themselves — proxy does not cover server-action POSTs.
- **Uploads**: browser → Cloudinary direct with signed params from `app/api/uploads/sign` (folder allowlist; `safe-africa/cvs` is the only unauthenticated folder). `components/upload-field.tsx` exposes the URL via hidden input.
- **Prisma 7 specifics**: connection URLs live in `prisma.config.ts` (not the schema); CLI + runtime both go through `@prisma/adapter-pg` because the Rust schema engine cannot reach Neon from this machine (P1001) — don't remove the adapter or the `as PrismaConfig` cast. Import types from `@/lib/generated/prisma/client`, never `@prisma/client`. Neon URLs must NOT contain `channel_binding=require`.
- **Theme**: Tailwind v4, tokens in `app/globals.css` (`@theme inline`, shadcn-style semantic vars + `--brand-*` palette from the logo). UI primitives in `components/ui/` are hand-written shadcn-style (no shadcn CLI — its current version's prompts don't work non-interactively here). Display font Bricolage Grotesque via `font-display` class; `evidence-bars` is the brand section marker.

## Environment gotchas

- Next 16: `params`/`searchParams` are Promises (`await props.params`); `revalidateTag` needs a second argument; images config uses `remotePatterns` URL objects.
- The Neon MCP server is connected (project `falling-heart-73335237`, org Jeckonia) — use it for SQL spot-checks instead of psql.
