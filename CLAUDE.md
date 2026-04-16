# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ActaFlow

> **ActaFlow — Action Item Extractor & Execution Engine**

Built by **Narendra** · [linkedin.com/in/nk-analytics](https://linkedin.com/in/nk-analytics)

ActaFlow turns every meeting into a **trackable execution workflow**. Drop in a recording or paste a transcript — every attendee receives a personalised email listing only their action items, with deadlines and priorities, within 2 minutes.

---

## Design System

### Skill
For ALL frontend/UI work — landing page, dashboard, components, emails — use the skill at:
`C:\Users\ES\.claude\skills\reactwebsite.skill`

Read it before writing any UI code. The rules below are project-specific overrides on top of that skill.

---

### Color Palette — Violet + Amber

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `oklch(0.985 0.006 90)` — warm off-white |
| Surface / Card | `--card` | `oklch(1 0.004 90)` — near-white warm |
| Foreground / Text | `--foreground` | `oklch(0.22 0.04 285)` — deep violet-graphite |
| Primary (Violet) | `--primary` | `oklch(0.55 0.25 285)` |
| Primary text on Violet | `--primary-foreground` | `oklch(0.985 0.006 90)` |
| Accent (Amber) | `--accent` | `oklch(0.80 0.17 75)` |
| Accent text on Amber | `--accent-foreground` | `oklch(0.22 0.04 285)` |
| Muted surface | `--muted` | `oklch(0.945 0.012 285)` |
| Muted text | `--muted-foreground` | `oklch(0.50 0.06 285)` |
| Border | `--border` | `oklch(0.88 0.02 285)` |

#### Absolute Color Rules
- **No dark backgrounds** — backgrounds are always warm off-white or white-tinted surfaces
- **No pure black text** — use `--foreground` (deep violet-graphite) only
- **No white buttons** — primary = Violet, secondary = Amber or light violet-tinted
- **No blue** on any interactive element
- **No pure gray** text — all muted text carries a slight violet undertone

---

### Typography

**Primary font:** `Plus Jakarta Sans` · **Mono font:** `JetBrains Mono`  
**Never** use Geist Sans, Inter, or system fonts.

```tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
```

| Label | Size | Weight | Use |
|---|---|---|---|
| Display | clamp(2.5rem, 5vw, 4rem) | 800 | Hero headlines |
| H1 | clamp(2rem, 4vw, 3rem) | 700 | Page titles |
| H2 | clamp(1.5rem, 3vw, 2.25rem) | 600 | Section headers |
| Body | 1rem / 1.6 | 400 | Paragraph text |
| Small | 0.875rem | 500 | Labels, captions |

---

### 2026 Design Direction

1. **Light + air** — generous whitespace, warm off-white backgrounds
2. **Gradient accents** — violet-to-amber linear gradients on hero elements, button states
3. **Layered depth** — cards use `box-shadow` with violet tint (`oklch(0.55 0.25 285 / 0.08)`), not flat outlines
4. **Micro-motion** — hover: `scale(1.02)` + shadow lift, 200ms ease-out; sections fade-up on scroll
5. **Rounded corners** — `1rem` (cards), `1.5rem` (modals), `9999px` (pills/badges)
6. **No decorative grids, mesh gradients, or glassmorphism**

#### Component Patterns
- **Primary button**: Violet fill, white-warm text, `px-6 py-3 rounded-full`, hover: brighten + scale(1.02)
- **Secondary button**: Amber fill, dark text, same sizing
- **Ghost button**: Violet border + violet text, transparent fill
- **Cards**: White-warm surface, violet-tinted shadow, 1rem radius, subtle border

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 16 · Tailwind CSS v4 · shadcn/ui |
| Auth | Clerk (`@clerk/nextjs` v7) |
| Database | Neon PostgreSQL · Drizzle ORM |
| AI | Gemini (`gemini-3-flash-preview`) |
| Background Jobs | Inngest |
| Email | Resend · React Email |
| File Storage | Cloudinary |
| Deployment | Vercel |

---

## Commands

```bash
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm run start        # Production server
npx tsc --noEmit     # TypeScript type-check
npm run db:push      # Push Drizzle schema to Neon (no migration files)
npm run db:generate  # Generate migration files from schema
npm run db:studio    # Open Drizzle Studio visual DB browser
```

Inngest and React Email have no dedicated dev scripts — Inngest runs via the `/api/inngest` route handler; use the Inngest Dev Server CLI separately (`npx inngest-cli@latest dev`) if needed.

---

## Architecture

### Current state
All layers are live: landing page, Clerk auth, Neon DB, dashboard, AI extraction (Gemini), background processing (Inngest), and per-attendee email (Resend).

```
src/
  proxy.ts                        # Clerk middleware (Next.js 16 — NOT middleware.ts)
  app/
    layout.tsx                    # ClerkProvider wraps children inside <body>
    globals.css                   # Tailwind v4 @theme inline — all CSS vars here, NOT tailwind.config
    page.tsx                      # Landing page — calls getOrCreateUser() on sign-in
    sign-in/[[...sign-in]]/       # Clerk <SignIn /> page
    sign-up/[[...sign-up]]/       # Clerk <SignUp /> page
    pricing/
      page.tsx                    # Pricing page — <PricingTable /> + static feature comparison table (Free/Plus/Pro)
    dashboard/
      layout.tsx                  # DashboardSidebar + main content shell
      page.tsx                    # Server component — fetches meetings + stats, renders DashboardClient
      new/page.tsx                # New meeting form — transcript paste + attendee emails
      [id]/page.tsx               # Meeting detail — action items, attendee list, email status
    api/
      inngest/route.ts            # Inngest webhook handler (must be public)
      meetings/route.ts           # GET — list meetings for user
      meetings/create/route.ts    # POST — paste transcript → create meeting → fire Inngest event
      meetings/upload/route.ts    # POST — upload audio/video → Cloudinary → fire Inngest event (runtime: nodejs, maxDuration: 60s)
      meetings/transcribe/route.ts # POST — transcribe uploaded file via Gemini Files API (maxDuration: 120s)
      meetings/[id]/route.ts      # GET — single meeting with attendees + action items
      action-items/[id]/done/     # GET — mark done via doneToken query param, redirects to /?done=success|invalid (no auth required)
  components/
    Navbar.tsx                    # Fixed navbar — Pricing links to /pricing; plan badge (Free/Plus/Pro) shown via useAuth().has() when signed in
    HeroSection.tsx               # Landing hero with animated counter
    dashboard/
      DashboardClient.tsx         # Animated stats cards + meeting list (client component)
      DashboardSidebar.tsx        # Sidebar nav with UserButton
      MeetingDetailClient.tsx     # Meeting detail view (client component)
    ui/                           # shadcn/ui primitives
  db/
    schema.ts                     # Drizzle schema — 6 tables (see below)
    index.ts                      # Neon HTTP db client — import { db } from '@/db'
  inngest/
    client.ts                     # Inngest client instance
    functions/processMeeting.ts   # Full pipeline: Gemini → DB → Resend emails
    functions/sendReminders.ts    # Daily cron (9 AM IST = 30 3 * * *) — reminder + overdue alert emails
  emails/
    ActionItemEmail.tsx           # React Email template — per-attendee personalised email
    ReminderEmail.tsx             # Reminder/overdue alert email — type: 'reminder' | 'overdue'
    DoneNotificationEmail.tsx     # Organiser notification when attendee marks item done
  lib/
    auth.ts                       # getOrCreateUser() — lazy Clerk→Neon sync
    gemini.ts                     # extractMeetingData() + transcribeVideo() — Gemini 3-Flash
    email.ts                      # sendActionItemEmail() + sendReminderEmail() + sendDoneNotificationEmail()
    cloudinary.ts                 # uploadVideoToCloudinary() — streams to actaflow/meetings folder
    utils.ts                      # cn() helper
drizzle.config.ts                 # schema: src/db/schema.ts, dialect: postgresql
```

### Meeting processing pipeline

Two entry points both fire the same Inngest event:
- **Paste flow**: `POST /api/meetings/create` (transcript in body)
- **Upload flow**: `POST /api/meetings/upload` (audio/video → Cloudinary → `audioUrl` stored)

Both fire `actaflow/meeting.uploaded` → `processMeeting` runs 5 idempotent steps (3 retries):
1. Mark meeting `status: 'processing'`
2. If `source: 'upload'` and no transcript: fetch from Cloudinary → `transcribeVideo()` via Gemini Files API (polls until ACTIVE, then cleans up) → persist transcript. Then call `extractMeetingData()` → returns title, summary, attendees `{name, email}[]`, action_items, decisions, blockers
3. Save attendees + action items — **3-tier email resolution**: form field (positional index) → Gemini-extracted email → fuzzy first-name match against form emails. Action items without a resolved email are skipped
4. Send per-attendee emails via Resend (skips if no email or no action items). Each email logged in `email_logs`. `doneToken` per action item is a cuid2 — enables `/api/action-items/{id}/done?token={doneToken}` links with no auth
5. Mark meeting `status: 'done'` (or `'failed'` on pipeline error)

### Reminder & notification pipeline

**Daily cron** (`sendReminders` — `30 3 * * *` = 9 AM IST): queries `action_items` for open items where `dueDate` is set, `ownerEmail` is not null, and `reminderSentAt` is null. Sends:
- **Reminder** email — item due today, or high-priority item due tomorrow
- **Overdue** email (red theme) — item past due date

After sending, stamps `reminderSentAt` so each item gets at most one reminder. Items with `status = 'done'` are excluded entirely.

**Done notification**: when an attendee hits `/api/action-items/[id]/done`, the route marks the item done then fires `sendDoneNotificationEmail()` to the meeting organiser (fire-and-forget — email failure never blocks the redirect).

### Email auto-detection (frontend)
`src/app/dashboard/new/page.tsx` runs a regex (`/[\w.+\-]+@[\w\-]+\.[\w.]+/g`) over the transcript as the user types and auto-fills the Attendee Emails field. Manual edits to the email field disable auto-fill (tracked via `useRef`).

### Key conventions

**Styling** — Tailwind v4, no `tailwind.config.ts`. All tokens in `@theme inline {}` in `globals.css`. Use `oklch()` exclusively — never hex or rgb for brand colors.

**Animations** — Framer Motion throughout. Type cubic-bezier arrays as `const EASE: [number, number, number, number]`. Dashboard stat cards use `animate()` from Framer Motion for number count-up on load.

**Images** — All assets on Cloudinary (`res.cloudinary.com`). Animated GIFs require `unoptimized` prop on `<Image>`.

---

## Auth (Clerk)

**Critical rules — always follow:**

- Middleware lives at `src/proxy.ts` (Next.js 16+). For Next.js ≤15 it would be `middleware.ts`.
- Use `<Show when="signed-in">` / `<Show when="signed-out">` from `@clerk/nextjs` — **never** the deprecated `<SignedIn>` / `<SignedOut>`.
- `<ClerkProvider>` wraps `{children}` inside `<body>` in `layout.tsx`.
- Client components: `useUser()` for auth state + user data.
- Server components / API routes: `auth()` from `@clerk/nextjs/server`.
- Always prefer `user.username` before `user.firstName` as the display name.
- All routes are public by default. Protected routes use `auth.protect()` inside `clerkMiddleware` in `proxy.ts`.
- `/api/inngest` must remain public — Inngest calls it from outside.
- `/api/action-items/[id]/done` must remain public — token-based, no Clerk needed.

---

## Clerk Billing

Plans are configured in the Clerk Dashboard (not in code). Three tiers: **Free**, **Plus** ($10/mo), **Pro** ($29/mo).

**Pricing page** (`src/app/pricing/page.tsx`) uses `<PricingTable />` from `@clerk/nextjs` — it renders the Clerk Dashboard plans automatically. The page is a plain server component with no auth logic; the Navbar's `handleNavClick` guard redirects unsigned users to `/sign-in` before they reach it.

**Checking plans in code:**
```ts
// Client component
const { has } = useAuth();
has({ plan: 'pro' })   // boolean

// Server component / API route
const { has } = await auth();
has({ plan: 'pro' })   // boolean
```

**Checking features** (for feature-gated access):
```ts
has({ feature: 'premium_access' })
```

The Navbar reads the current plan client-side via `useAuth().has()` and renders a coloured pill badge next to `<UserButton />` — violet for Pro, amber for Plus, muted for Free.

---

## Database (Neon + Drizzle)

**Driver:** `@neondatabase/serverless` HTTP (`drizzle-orm/neon-http`) — correct for Vercel serverless.

**Import db anywhere:**
```ts
import { db } from '@/db';
```

**Lazy user sync — no Clerk webhook needed:**
```ts
import { getOrCreateUser } from '@/lib/auth';
const user = await getOrCreateUser(); // creates DB row on first call
```

### All FK constraints use CASCADE DELETE
Every FK in the schema has `{ onDelete: 'cascade' }`. Deleting a `users` row cascades through meetings → attendees → action_items → email_logs and contacts. Safe to delete a user in Drizzle Studio for testing — re-signing in via Clerk recreates the row via `getOrCreateUser()`.

### Critical: Clerk IDs are NOT UUIDs
Clerk user IDs have the format `user_xxxxxxx` — they are **strings, not UUIDs**.
- `users.id` is `text` type (NOT `uuid`) — **never change this to uuid**
- All FK columns referencing `users.id` (`meetings.user_id`, `action_items.user_id`, `contacts.user_id`) must also be `text`
- All other PKs (meetings, attendees, action_items, email_logs, contacts) use `uuid().defaultRandom()` — that's fine

### Critical: DATABASE_URL format for Neon HTTP driver
Use the **direct** connection string — **not** the pooler URL.
- Correct: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
- Wrong: `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

Remove `-pooler` from hostname and remove `&channel_binding=require`. The Neon HTTP driver uses fetch requests, not the Postgres wire protocol — the pooler endpoint and channel binding will cause query failures.

---

## Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
GEMINI_API_KEY=
DATABASE_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
INNGEST_DEV=1                    # Local only — do NOT set on Vercel (absence = production mode)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

*ActaFlow — Turn meetings into action.*
