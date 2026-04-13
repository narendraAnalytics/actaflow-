# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# ActaFlow

> **ActaFlow — Action Item Extractor & Execution Engine**

Built by **Narendra** · [linkedin.com/in/nk-analytics](https://linkedin.com/in/nk-analytics)

---

## What is ActaFlow?

ActaFlow turns every meeting into a **trackable execution workflow**. Drop in a recording or paste a transcript — every attendee receives a personalised email listing only their action items, with deadlines and priorities, within 2 minutes.

This is not a meeting summary tool. It is the system that ensures what was decided in a meeting **actually gets done**.

---

## Design System

### Skill
For ALL frontend/UI work — landing page, dashboard, components, emails — use the skill at:
`C:\Users\ES\.claude\skills\reactwebsite.skill`

Read it before writing any UI code. The rules below are project-specific overrides on top of that skill.

---

### Color Palette — Violet + Amber

ActaFlow uses a **Violet + Amber** palette. Violet = authority, precision, intelligence. Amber = urgency, action, energy. Together they communicate: "decisions get made and executed here."

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
- **No dark backgrounds** anywhere in the app — backgrounds are always warm off-white or white-tinted surfaces
- **No pure black text** — use `--foreground` (deep violet-graphite) only
- **No white buttons** — primary buttons are Violet, secondary buttons are Amber or light violet-tinted
- **No blue** of any shade on any interactive element
- **No clay / brown / beige / gray** on buttons or text
- **No pure gray** text — all muted text carries a slight violet undertone

---

### Typography

**Primary font:** `Plus Jakarta Sans` — geometric, confident, 2026-era SaaS standard  
**Mono font:** `JetBrains Mono` — for code, tokens, timestamps

```tsx
// layout.tsx import pattern
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
```

#### Type Scale (fluid, CSS clamp)
| Label | Size | Weight | Use |
|---|---|---|---|
| Display | clamp(2.5rem, 5vw, 4rem) | 800 | Hero headlines |
| H1 | clamp(2rem, 4vw, 3rem) | 700 | Page titles |
| H2 | clamp(1.5rem, 3vw, 2.25rem) | 600 | Section headers |
| H3 | clamp(1.25rem, 2vw, 1.75rem) | 600 | Card titles |
| Body | 1rem / 1.6 line-height | 400 | Paragraph text |
| Small | 0.875rem | 500 | Labels, captions |

#### Typography Rules
- Headlines: `font-weight: 700–800`, tight letter spacing (`-0.02em` to `-0.04em`)
- Body: `font-weight: 400`, comfortable line height `1.6–1.7`
- Labels / badges: `font-weight: 500–600`, `letter-spacing: 0.02em`
- **Never** use Geist Sans, Inter, or system fonts in this project

---

### 2026 Design Direction

ActaFlow pages follow a **2026 SaaS premium** aesthetic:

1. **Light + air** — generous whitespace, warm off-white backgrounds, surfaces with subtle violet tints
2. **Gradient accents** — violet-to-amber linear gradients on hero elements, section dividers, button states
3. **Layered depth** — cards use `box-shadow` with slight violet tint (`oklch(0.55 0.25 285 / 0.08)`), not flat outlines
4. **Bold type contrast** — large, confident headlines with tight tracking; small supporting text well below
5. **Micro-motion** — hover states use `scale(1.02)` + shadow lift, 200ms ease-out; page elements fade-up on scroll
6. **Rounded corners** — `border-radius: 1rem` (cards), `1.5rem` (modals), `9999px` (pills/badges)
7. **No decorative grids, no mesh gradients, no glassmorphism** — clean and purposeful only

#### Component Patterns
- **Primary button**: Violet fill `--primary`, white-warm text, `px-6 py-3`, `rounded-full`, hover: brighten + scale(1.02)
- **Secondary button**: Amber fill `--accent`, dark text, same sizing
- **Ghost button**: Violet border + violet text, transparent fill, hover: light violet fill
- **Badge/pill (High priority)**: Amber background, dark amber text
- **Badge/pill (Medium)**: Violet-light background, violet text
- **Badge/pill (Low)**: Muted background, muted-foreground text
- **Cards**: White-warm surface, violet-tinted shadow, 1rem radius, subtle border

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 · Tailwind CSS v4 · shadcn/ui |
| Auth | Clerk |
| Database | Neon PostgreSQL · Drizzle ORM |
| AI | gemini-2.0-flash-preview |
| Background Jobs | Inngest |
| Email | Resend · React Email |
| File Storage | Cloudinary |
| Deployment | Vercel |

---

## Execution Engine Features

- **Action Item Extraction** — every commitment captured, owner assigned, context included
- **Priority Detection** — High / Medium / Low auto-labelled from language signals
- **Decision Extraction** — stored separately, searchable across all meetings
- **Owner Assignment** — personalised email per attendee showing only their tasks
- **Deadline Tracking** — Inngest cron sends daily reminders until done
- **Status Tracking** — one-click done from email, no login required
- **Workflow Continuity** — carry-forward, pre-meeting briefs, velocity metrics

---

## Commands

```bash
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm run start        # Production server
npx tsc --noEmit     # TypeScript type-check (no test runner configured yet)

# These scripts need adding to package.json when the layers are built:
# npm run db:push     → drizzle-kit push (Neon schema sync)
# npm run inngest:dev → Inngest dev server (separate terminal)
# npm run email:dev   → react-email preview server (separate terminal)
```

---

## Architecture

### Current state
Only the marketing landing page exists. No auth, DB, or AI layers are wired yet.

```
src/
  app/
    layout.tsx        # Root layout — imports Plus Jakarta Sans + JetBrains Mono, sets metadata
    globals.css       # Tailwind v4 @theme inline block — all CSS vars live here, NOT in tailwind.config
    page.tsx          # Landing page — h-svh overflow-hidden wrapper, Navbar + HeroSection only
  components/
    Navbar.tsx        # Fixed transparent navbar, Sheet drawer for mobile
    HeroSection.tsx   # Full-viewport hero: left text col + right laptop-frame mockup + floating badges
    ui/               # shadcn/ui primitives (radix-nova style, lucide icons)
  lib/
    utils.ts          # cn() helper (clsx + tailwind-merge)
```

### Key conventions established

**Styling** — Tailwind v4 with no `tailwind.config.ts`. All theme tokens (colors, radius, fonts) are defined as CSS custom properties inside `@theme inline {}` in `globals.css`. Use `oklch()` color space exclusively — never hex or rgb for brand colors.

**Animations** — Framer Motion throughout. Always type cubic-bezier ease arrays as `const EASE: [number, number, number, number]`, and string eases as `"easeInOut" as const` to satisfy Framer Motion's strict `Easing` type.

**Images** — All assets on Cloudinary (`res.cloudinary.com`). Allowed in `next.config.ts` via `remotePatterns`. Animated GIFs must use `unoptimized` prop on `<Image>`.

**Page structure** — Landing page is `h-svh overflow-hidden` (single viewport, no scroll) while only the hero exists. As new sections are added, remove `overflow-hidden` and restore scrolling.

**Framer Motion + `useInView`** — Every section has a `ref` + `useInView({ once: true })`. Custom variants use the `custom` prop for staggered index-based delays.

### Planned layers (not yet built)
- `src/app/(auth)/` — Clerk sign-in / sign-up pages
- `src/app/dashboard/` — authenticated app shell
- `src/db/` — Drizzle schema (meetings, action items, attendees)
- `src/inngest/` — background job functions (AI extraction, email dispatch, reminders)
- `src/emails/` — React Email templates (per-attendee action item email)
- `src/lib/gemini.ts` — Gemini 2.0 Flash transcript → action items

---

## Environment Variables

```env
GEMINI_API_KEY=
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
RESEND_API_KEY=
RESEND_FROM_EMAIL=
RESEND_FROM_NAME=
EMAIL_FROM=meetings@yourdomain.com
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
