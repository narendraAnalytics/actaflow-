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
    features/
      page.tsx                    # Features page — horizontal snap-scroll carousel (10 slides: hero + 8 features + tech stack + CTA). Client component. Protected: unsigned users redirected to /sign-in by Navbar handleNavClick.
    dashboard/
      layout.tsx                  # DashboardSidebar + main content shell
      page.tsx                    # Server component — fetches meetings + stats, renders DashboardClient
      new/page.tsx                # Server wrapper — fetches PlanInfo, renders NewMeetingForm
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
    Navbar.tsx                    # Fixed navbar — Features links to /features; Pricing to /pricing; plan badge (Free/Plus/Pro) via useAuth().has(). handleNavClick redirects unsigned users to /sign-in for all nav links.
    HeroSection.tsx               # Landing hero with animated counter
    dashboard/
      DashboardClient.tsx         # Animated stats cards + meeting list + plan usage banner (client component)
      DashboardSidebar.tsx        # Sidebar nav with UserButton
      MeetingDetailClient.tsx     # Meeting detail view (client component)
      NewMeetingForm.tsx          # New meeting client form — paste/upload tabs, plan restriction UI, limit error cards
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
    auth.ts                       # getOrCreateUser() — lazy Clerk→Neon sync + lazy plan sync on every call
    plans.ts                      # PLAN_LIMITS, PlanInfo, PlanKey, getMonthStart(), isThisMonth() — plan constants hub
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

Both fire `actaflow/meeting.uploaded` → `processMeeting` runs 6 idempotent steps (3 retries):
1. Mark meeting `status: 'processing'`
2. Fetch `users.plan` for the meeting owner (used in step 5 for email cap)
3. If `source: 'upload'` and no transcript: fetch from Cloudinary → `transcribeVideo()` via Gemini Files API (polls until ACTIVE, then cleans up) → persist transcript. Then call `extractMeetingData()` → returns title, summary, attendees `{name, email}[]`, action_items, decisions, blockers
4. Save attendees + action items — **3-tier email resolution**: form field (positional index) → Gemini-extracted email → fuzzy first-name match against form emails. Action items without a resolved email are skipped
5. Send per-attendee emails via Resend — **capped at `PLAN_LIMITS[plan].maxAttendeeEmails`** (3 for free, unlimited for plus/pro). Each email logged in `email_logs`. `doneToken` per action item is a cuid2 — enables `/api/action-items/{id}/done?token={doneToken}` links with no auth
6. Mark meeting `status: 'done'` (or `'failed'` on pipeline error)

### Reminder & notification pipeline

**Daily cron** (`sendReminders` — `30 3 * * *` = 9 AM IST): queries `action_items` joined with `users` for open items where `dueDate` is set, `ownerEmail` is not null, and `reminderSentAt` is null. Sends:
- **Reminder** email — item due today, or high-priority item due tomorrow
- **Overdue** email (red theme) — item past due date

After sending, stamps `reminderSentAt` on each action item. Items with `status = 'done'` are excluded entirely.

**Free plan cap**: before sending, items are grouped by `userId`. If `users.reminderMonthSentAt` is in the current calendar month, that user's entire batch is skipped. After the first successful send for a free-plan user, `users.reminderMonthSentAt` is set to today — enforcing one reminder batch per month.

**Done notification**: when an attendee hits `/api/action-items/[id]/done`, the route marks the item done then fires `sendDoneNotificationEmail()` to the meeting organiser (fire-and-forget — email failure never blocks the redirect).

### Email auto-detection (frontend)
`src/components/dashboard/NewMeetingForm.tsx` runs a regex (`/[\w.+\-]+@[\w\-]+\.[\w.]+/g`) over the transcript as the user types and auto-fills the Attendee Emails field. Manual edits to the email field disable auto-fill (tracked via `useRef`).

### Key conventions

**Styling** — Tailwind v4, no `tailwind.config.ts`. All tokens in `@theme inline {}` in `globals.css`. Use `oklch()` exclusively — never hex or rgb for brand colors.

**Animations** — Framer Motion throughout. Type cubic-bezier arrays as `const EASE: [number, number, number, number]`. Dashboard stat cards use `animate()` from Framer Motion for number count-up on load.

**Images** — All assets on Cloudinary (`res.cloudinary.com`). Animated GIFs require `unoptimized` prop on `<Image>`. Screenshot URLs for the features page are catalogued in `images.txt` (feature descriptions) and `error.txt` (Cloudinary URLs) at the repo root.

**Horizontal carousel pattern** (`src/app/features/page.tsx`) — `fixed inset-0` container with `overflow-x: scroll` + `scroll-snap-type: x mandatory`. Each slide is `w-screen h-screen` with `scroll-snap-align: start`. Navigation: prev/next arrow buttons (AnimatePresence fade), dot indicators (active dot expands to pill), keyboard ← → support via `useRef`-tracked current index. Slide content animates in via `textContainer` stagger + `imgVariant` only when `active` prop is true — re-animates on every slide visit.

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

### Plan enforcement architecture

**Source of truth:** Clerk. **DB cache:** `users.plan`. **Sync:** lazy — `getOrCreateUser()` calls `has({ plan: 'pro' })` / `has({ plan: 'plus' })` on every request and updates DB if the plan changed. No webhook needed.

**Plan limits** are defined once in `src/lib/plans.ts`:
```ts
import { PLAN_LIMITS, type PlanKey, type PlanInfo } from '@/lib/plans';
// Free: 2 meetings/mo, 3 attendee emails, monthly reminder
// Plus: 20 meetings/mo, unlimited emails, daily reminder
// Pro:  unlimited everything
```

**`PlanInfo` prop pattern** — server components compute and pass down:
```ts
// In server page components (dashboard/page.tsx, dashboard/new/page.tsx):
const user = await getOrCreateUser(); // syncs plan
const limits = PLAN_LIMITS[user.plan as PlanKey];
const planInfo: PlanInfo = { plan, meetingsThisMonth, meetingLimit, maxAttendeeEmails, isAtLimit, isUnlimited };
// Pass as prop to client component — client never calls Clerk for plan checks
```

**Hard enforcement** (API layer, independent of UI):
- `POST /api/meetings/create` and `POST /api/meetings/upload` return `{ error: 'MEETING_LIMIT_REACHED' }` (403) or `{ error: 'ATTENDEE_LIMIT_EXCEEDED' }` (403) before any DB/Cloudinary work.
- `processMeeting` Inngest function caps the attendee email loop at `PLAN_LIMITS[plan].maxAttendeeEmails`.

**UI enforcement** — `NewMeetingForm.tsx` receives `planInfo` and:
- Disables both tabs + shows lock/upgrade banner when `isAtLimit`
- Shows inline amber warning when free-plan user exceeds 3 emails
- Renders plan-specific upgrade cards (not generic error boxes) when API returns limit error codes

---

### Webhook-Free Plan Sync — How It Works

> **Why no webhook?** Webhooks arrive out-of-order, can be missed, and require a public endpoint + signature verification. The lazy-sync pattern below is simpler, more reliable, and zero-config.

#### Pillar 1 — Lazy sync inside `getOrCreateUser()` (`src/lib/auth.ts`)

Every protected request calls `getOrCreateUser()`, which does this atomically:

```ts
const { userId, has } = await auth();
const clerkPlan = has({ plan: 'pro' }) ? 'pro'
                : has({ plan: 'plus' }) ? 'plus'
                : 'free';

const [existing] = await db.select().from(users).where(eq(users.id, userId));

if (existing && existing.plan !== clerkPlan) {
  // Plan changed in Clerk → write it to DB immediately, same request
  return db.update(users).set({ plan: clerkPlan }).where(eq(users.id, userId)).returning()[0];
}
```

No queue, no delay — the DB is always up-to-date by the time any business logic runs.

#### Pillar 2 — DB is a write-through cache; Clerk is the source of truth

| Store | Role |
|---|---|
| Clerk metadata | Source of truth — `has({ plan })` is the canonical check |
| `users.plan` (Neon) | Write-through cache — overwritten on every `getOrCreateUser()` call |

Because every server request calls `getOrCreateUser()`, the cache is never stale for more than one request. This eliminates the entire class of "webhook missed / processed out-of-order" bugs.

#### Pillar 3 — Server-side `PlanInfo` prop pattern (no Clerk calls on the client)

Server page components pre-compute a `planInfo` object and pass it as a serialised prop:

```ts
// dashboard/page.tsx or dashboard/new/page.tsx (Server Component)
const user = await getOrCreateUser();          // syncs Clerk → DB
const limits = PLAN_LIMITS[user.plan as PlanKey];
const planInfo: PlanInfo = {
  plan: user.plan as PlanKey,
  meetingsThisMonth,
  meetingLimit: limits.meetingsPerMonth,
  maxAttendeeEmails: limits.maxAttendeeEmails,
  isAtLimit: limits.meetingsPerMonth !== Infinity && meetingsThisMonth >= limits.meetingsPerMonth,
  isUnlimited: limits.meetingsPerMonth === Infinity,
};
return <ClientComponent planInfo={planInfo} />;
```

Client components read `planInfo` from props — they never call Clerk or the DB. React hydration is always consistent with the server-rendered plan state.

#### Pillar 4 — API-layer hard enforcement (fail-fast, independent of UI)

Every mutation route re-syncs before doing any work:

```ts
// POST /api/meetings/create  (and /api/meetings/upload)
const user = await getOrCreateUser();          // re-syncs plan from Clerk
const limits = PLAN_LIMITS[user.plan as PlanKey];

if (limits.meetingsPerMonth !== Infinity && monthCount >= limits.meetingsPerMonth) {
  return NextResponse.json({ error: 'MEETING_LIMIT_REACHED' }, { status: 403 });
}
```

Typed error codes (`MEETING_LIMIT_REACHED`, `ATTENDEE_LIMIT_EXCEEDED`) let the client render plan-specific upgrade UI instead of generic error boxes. The Inngest `processMeeting` function also independently caps the email loop at `PLAN_LIMITS[plan].maxAttendeeEmails` as a final safety net.

#### Reuse checklist for future projects

- [ ] `users.plan` column — `varchar`, default `'free'`
- [ ] `getOrCreateUser()` — reads Clerk `has()`, diffs against DB, updates if changed, returns fresh user
- [ ] `PLAN_LIMITS` map — single source of truth for all tier limits
- [ ] `PlanInfo` interface — computed server-side, passed as prop to all client components
- [ ] All mutation API routes call `getOrCreateUser()` before any DB/storage work
- [ ] Clerk Dashboard plan slugs match exactly: `'plus'`, `'pro'` (lowercase)

---

**Critical:** Clerk plan slugs must be exactly `'plus'` and `'pro'` (lowercase) in the Clerk Dashboard — the sync logic uses `has({ plan: 'pro' })` which matches the slug literally.

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
const user = await getOrCreateUser(); // creates DB row on first call; syncs users.plan from Clerk on every call
```

### users table key columns
- `plan` (varchar, default `'free'`) — synced from Clerk on every `getOrCreateUser()` call
- `meetingsUsed` (integer) — legacy counter, not used for enforcement; monthly count is queried live from `meetings`
- `reminderMonthSentAt` (timestamp, nullable) — set after first reminder email sent to a free-plan user each month; null = never sent this month

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
