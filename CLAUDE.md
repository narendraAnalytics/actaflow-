#ActaFlow

> **ActaFlow Action Item Extractor & Execution Engine**

Built by **Narendra** · [linkedin.com/in/nk-analytics](https://linkedin.com/in/nk-analytics)

---

## What is ActaFlow?

AcatFlow turns every meeting into a **trackable execution workflow**. Drop in a recording or paste a transcript — every attendee receives a personalised email listing only their action items, with deadlines and priorities, within 2 minutes.

This is not a meeting summary tool. It is the system that ensures what was decided in a meeting **actually gets done**.

---

## Design Skill
For ALL frontend/UI work — landing page, dashboard, components, emails — use the skill at:
`C:\Users\ES\.claude\skills\reactwebsite.skill`

This skill defines the color system, typography, animation stack, component patterns, and quality standards. Read it before writing any UI code. Do not deviate from its rules.

When examining UI references, use the Playwright MCP server to screenshot and inspect the target site.

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 15 · Tailwind CSS · shadcn/ui |
| Auth | Clerk |
| Database | Neon PostgreSQL · Drizzle ORM |
| AI | gemini-3-flash-preview | 
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

## Quick Start

```bash
# Install dependencies
npm install

# Push schema to Neon
npm run db:push

# Start dev server
npm run dev

# Start Inngest dev server (separate terminal)
npm run inngest:dev

# Preview email templates (separate terminal)
npm run email:dev
```

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

*ActaFlow -  Turn meetings into action.*