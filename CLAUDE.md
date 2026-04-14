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
| AI | Gemini 2.0 Flash (`gemini-2.0-flash-preview`) |
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

# Add to package.json when layers are built:
# npm run db:push     → drizzle-kit push (Neon schema sync)
# npm run inngest:dev → Inngest dev server (separate terminal)
# npm run email:dev   → react-email preview server (separate terminal)
```

---

## Architecture

### Current state
Landing page + Clerk auth are live. DB, AI, and email layers are not yet wired.

```
src/
  proxy.ts              # Clerk middleware (Next.js 16 uses proxy.ts, not middleware.ts)
  app/
    layout.tsx          # ClerkProvider wraps children inside <body>
    globals.css         # Tailwind v4 @theme inline — all CSS vars live here, NOT tailwind.config
    page.tsx            # Landing page — h-svh overflow-hidden, Navbar + HeroSection
    sign-in/
      [[...sign-in]]/
        page.tsx        # Centered <SignIn /> with ActaFlow brand header
    sign-up/
      [[...sign-up]]/
        page.tsx        # Centered <SignUp /> — username field enabled in Clerk dashboard
  components/
    Navbar.tsx          # Fixed navbar: logo center, nav links left, UserButton right (signed-in)
    HeroSection.tsx     # Full-viewport hero with animated counter, welcome banner (signed-in)
    ui/                 # shadcn/ui primitives (lucide icons)
  lib/
    utils.ts            # cn() helper (clsx + tailwind-merge)
```

### Key conventions

**Styling** — Tailwind v4, no `tailwind.config.ts`. All tokens in `@theme inline {}` in `globals.css`. Use `oklch()` exclusively — never hex or rgb for brand colors.

**Animations** — Framer Motion throughout. Type cubic-bezier arrays as `const EASE: [number, number, number, number]`, string eases as `"easeInOut" as const`. Every section uses `ref` + `useInView({ once: true })` for scroll-triggered animations.

**Images** — All assets on Cloudinary (`res.cloudinary.com`). Animated GIFs require `unoptimized` prop on `<Image>`.

**Page structure** — Landing page is `h-svh overflow-hidden` while only the hero exists. Remove `overflow-hidden` when adding scrollable sections.

---

## Auth (Clerk)

**Critical rules — always follow:**

- Middleware lives at `src/proxy.ts` (Next.js 16+). For Next.js ≤15 it would be `middleware.ts`.
- Use `<Show when="signed-in">` / `<Show when="signed-out">` from `@clerk/nextjs` — **never** the deprecated `<SignedIn>` / `<SignedOut>`.
- `<ClerkProvider>` wraps `{children}` inside `<body>` in `layout.tsx`.
- Client components: `useUser()` for auth state + user data.
- Server components / API routes: `auth()` from `@clerk/nextjs/server`.
- Username is enabled in the Clerk dashboard — always prefer `user.username` before `user.firstName` as the display name.
- All routes are public by default. Protected routes use `auth.protect()` inside `clerkMiddleware` in `proxy.ts`.

**Auth flow:**
- Unauthenticated user clicks nav links (Features / How It Works / Pricing) → redirected to `/sign-in`
- "Get Started Free" CTA → `/sign-up`
- After sign-in/up → redirects to `/` (update `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` when dashboard is ready)

---

### Planned layers (not yet built)
- `src/app/dashboard/` — authenticated app shell (protect via `auth.protect()` in proxy.ts)
- `src/db/` — Drizzle schema (meetings, action items, attendees)
- `src/lib/auth.ts` — `getOrCreateUser()` for lazy DB user creation on first API call
- `src/inngest/` — background jobs (AI extraction, email dispatch, reminders)
- `src/emails/` — React Email templates (per-attendee action item email)
- `src/lib/gemini.ts` — Gemini 2.0 Flash transcript → action items

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
INNGEST_DEV=1
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

*ActaFlow — Turn meetings into action.*
