"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Mail,
  LayoutDashboard,
  Bell,
  CheckCircle2,
  AtSign,
  ShieldCheck,
  ArrowRight,
  Home,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    icon: FileText,
    number: "01",
    title: "Transcript Paste & Instant Extraction",
    description:
      "Paste any meeting transcript — Google Meet, Zoom, Otter.ai, or manual notes — and ActaFlow's Gemini AI returns a structured breakdown of attendees, action items, decisions, and blockers instantly.",
    problem: "Eliminates 20–40 minutes of manual extraction per meeting. Works with any transcript format — no special export required.",
    who: "Team leads, project managers, anyone running recurring meetings.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438449/feature1_z6azbr.png",
    accent: "oklch(0.52 0.28 300)",
    accentBg: "oklch(0.52 0.28 300 / 0.08)",
  },
  {
    icon: Upload,
    number: "02",
    title: "Audio / Video Upload & Auto-Transcription",
    description:
      "Upload MP4, MP3, WAV, or WebM — up to 500 MB on Pro. ActaFlow uploads to Cloudinary and uses the Gemini Files API to transcribe speech automatically, then runs the full extraction pipeline.",
    problem: "Unlocks recordings that were never transcribed. A Zoom recording or Loom video produces action items without anyone watching it.",
    who: "Remote teams, async-first companies, anyone using video calls.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438448/feature2_qeidx4.png",
    accent: "oklch(0.48 0.24 260)",
    accentBg: "oklch(0.48 0.24 260 / 0.08)",
  },
  {
    icon: Mail,
    number: "03",
    title: "Personalised Per-Attendee Emails",
    description:
      "Each attendee receives only their action items — task description, priority (high / medium / low), due date, and a one-click Mark as Done link that needs no login. A 3-tier email resolution system finds the right address every time.",
    problem: "Eliminates the 'read the whole notes' friction. Each person gets exactly what they need in their inbox within 2 minutes.",
    who: "Every meeting attendee — especially those in multiple meetings.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438442/feature3_tifwzf.png",
    accent: "oklch(0.55 0.22 320)",
    accentBg: "oklch(0.55 0.22 320 / 0.08)",
  },
  {
    icon: LayoutDashboard,
    number: "04",
    title: "Action Item Tracker Dashboard",
    description:
      "A visual dashboard shows every meeting processed, its status (processing / done / failed), all attendees, and their action items. Animated stat cards surface total meetings, items extracted, and emails sent. A usage banner shows plan limits with an upgrade path.",
    problem: "One place to check: 'Did everyone get their tasks? Are items resolved?' — without chasing anyone on Slack.",
    who: "Project managers, team leads, meeting organisers.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438445/feature4_fwp80z.png",
    accent: "oklch(0.50 0.26 240)",
    accentBg: "oklch(0.50 0.26 240 / 0.08)",
  },
  {
    icon: Bell,
    number: "05",
    title: "Automated Reminders & Overdue Alerts",
    description:
      "A daily cron job at 9 AM IST scans all open action items. It sends reminder emails for items due today or high-priority items due tomorrow, and red-themed overdue alerts for past-due items. Each item is stamped after its first reminder — no spam.",
    problem: "Removes manual follow-up entirely. 'I forgot' is no longer a valid excuse — the system follows up for you.",
    who: "Everyone with recurring deadlines and distributed teams.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438444/feature5_qw4bdv.png",
    accent: "oklch(0.58 0.22 30)",
    accentBg: "oklch(0.58 0.22 30 / 0.08)",
  },
  {
    icon: CheckCircle2,
    number: "06",
    title: "One-Click Mark as Done — No Login",
    description:
      "Every action item email includes a unique tokenised link. One click marks the item done in the database — no account, no app, no friction. The meeting organiser gets an instant notification email when any attendee completes their task.",
    problem: "Zero friction for attendees. The organiser gets real-time completion visibility without asking 'did you finish that?'",
    who: "All attendees + organisers tracking completion.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438454/feature6_mc9c18.png",
    accent: "oklch(0.52 0.20 155)",
    accentBg: "oklch(0.52 0.20 155 / 0.08)",
  },
  {
    icon: AtSign,
    number: "07",
    title: "Email Auto-Detection from Transcript",
    description:
      "As you type or paste a transcript, ActaFlow runs a real-time regex and auto-fills the Attendee Emails field with any addresses found in the text. Manual edits disable auto-fill so deliberate changes are never overwritten.",
    problem: "Saves copy-pasting of emails already in the transcript — Zoom transcripts often include participant emails in the header.",
    who: "Anyone pasting transcripts that already contain email addresses.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438449/feature7_rfgefp.png",
    accent: "oklch(0.55 0.25 285)",
    accentBg: "oklch(0.55 0.25 285 / 0.08)",
  },
  {
    icon: ShieldCheck,
    number: "08",
    title: "Plan-Gated Access & Upgrade Flows",
    description:
      "Three tiers — Free, Plus ($10/mo), Pro ($29/mo) — enforced at every layer: UI warnings, API hard-blocks, and background job caps. Plan changes sync instantly from Clerk Billing on the very next request via lazy-sync. No webhook needed.",
    problem: "Small teams trial the full workflow for free. Paid plans remove the limits that matter most as the team grows.",
    who: "Growing teams who outgrow the free tier.",
    image: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438448/feature8_tb1jwb.png",
    accent: "oklch(0.75 0.17 75)",
    accentBg: "oklch(0.80 0.17 75 / 0.08)",
  },
];

// hero + 8 features + tech details + CTA
const TOTAL = FEATURES.length + 3;

/* ── Animation variants ── */
const textContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};
const textItem = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};
const imgVariant = {
  hidden: { opacity: 0, x: 28, scale: 0.97 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.65, ease: EASE, delay: 0.15 } },
};

/* ── Slide wrapper ── */
function Slide({ children, bg }: { children: React.ReactNode; bg?: string }) {
  return (
    <div
      className="relative flex-shrink-0 w-screen h-screen overflow-hidden"
      style={{
        scrollSnapAlign: "start",
        background: bg ?? "oklch(0.985 0.006 90)",
      }}
    >
      {children}
    </div>
  );
}

/* ── Hero slide ── */
function HeroSlide({ active }: { active: boolean }) {
  return (
    <Slide>
      {/* Blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute rounded-full blur-3xl"
          style={{ width: 600, height: 600, background: "oklch(0.55 0.25 285 / 0.07)", top: "-10%", left: "50%", transform: "translateX(-50%)" }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{ width: 300, height: 300, background: "oklch(0.80 0.17 75 / 0.08)", bottom: "8%", right: "8%" }}
        />
      </div>

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-16">
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          className="max-w-3xl"
        >
          <motion.span
            variants={textItem}
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.12), oklch(0.80 0.17 75 / 0.12))",
              border: "1px solid oklch(0.52 0.28 300 / 0.25)",
              color: "oklch(0.40 0.22 300)",
            }}
          >
            8 Powerful Features
          </motion.span>

          <motion.h1
            variants={textItem}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
            style={{ color: "oklch(0.22 0.04 285)" }}
          >
            Every Feature Built{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.72 0.20 75) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              for Execution
            </span>
          </motion.h1>

          <motion.p
            variants={textItem}
            className="text-lg sm:text-xl leading-relaxed mb-10"
            style={{ color: "oklch(0.44 0.06 285)" }}
          >
            From raw transcript to inbox-ready action items — here&apos;s how ActaFlow closes the loop.
          </motion.p>

          <motion.div variants={textItem} className="flex flex-wrap justify-center gap-2">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <span
                  key={f.number}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: "oklch(0.945 0.012 285)",
                    border: "1px solid oklch(0.88 0.02 285)",
                    color: "oklch(0.44 0.10 285)",
                  }}
                >
                  <Icon size={11} strokeWidth={2.2} />
                  {f.title.split("&")[0].split("—")[0].trim()}
                </span>
              );
            })}
          </motion.div>

          <motion.p
            variants={textItem}
            className="mt-10 text-sm"
            style={{ color: "oklch(0.60 0.08 285)" }}
          >
            Use the arrows or keyboard ← → to explore
          </motion.p>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ── Feature slide ── */
function FeatureSlide({
  feature,
  active,
}: {
  feature: (typeof FEATURES)[0];
  active: boolean;
}) {
  const Icon = feature.icon;

  return (
    <Slide>
      {/* Accent glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 480,
          height: 480,
          background: feature.accentBg,
          top: "50%",
          right: "-8%",
          transform: "translateY(-50%)",
        }}
      />

      <div className="relative h-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16 px-6 sm:px-10 lg:px-20 pt-20 pb-16 max-w-7xl mx-auto w-full">

        {/* ── Text column ── */}
        <motion.div
          className="flex-1 min-w-0 flex flex-col justify-center"
          variants={textContainer}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
        >
          {/* Number + icon badge */}
          <motion.div variants={textItem} className="flex items-center gap-3 mb-4">
            <span
              className="text-7xl font-black leading-none select-none"
              style={{ color: `${feature.accent.replace(")", " / 0.10)")}`, letterSpacing: "-0.04em" }}
            >
              {feature.number}
            </span>
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: feature.accentBg,
                border: `1px solid ${feature.accent.replace(")", " / 0.30)")}`,
                color: feature.accent,
              }}
            >
              <Icon size={12} strokeWidth={2.5} />
              Feature
            </span>
          </motion.div>

          <motion.h2
            variants={textItem}
            className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
            style={{ color: "oklch(0.22 0.04 285)" }}
          >
            {feature.title}
          </motion.h2>

          <motion.p
            variants={textItem}
            className="text-base leading-relaxed mb-6"
            style={{ color: "oklch(0.44 0.06 285)", maxWidth: 480 }}
          >
            {feature.description}
          </motion.p>

          {/* Problem solved */}
          <motion.div
            variants={textItem}
            className="rounded-2xl px-5 py-4 mb-5"
            style={{
              background: "linear-gradient(135deg, oklch(0.80 0.17 75 / 0.14), oklch(0.80 0.17 75 / 0.05))",
              border: "1px solid oklch(0.80 0.17 75 / 0.32)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "oklch(0.42 0.14 75)" }}>
              Problem Solved
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "oklch(0.34 0.08 75)" }}>
              {feature.problem}
            </p>
          </motion.div>

          <motion.p variants={textItem} className="text-sm" style={{ color: "oklch(0.55 0.06 285)" }}>
            <span className="font-semibold" style={{ color: "oklch(0.40 0.12 285)" }}>Who benefits: </span>
            {feature.who}
          </motion.p>
        </motion.div>

        {/* ── Image column ── */}
        <motion.div
          className="flex-1 min-w-0 w-full lg:max-w-[52%]"
          variants={imgVariant}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
        >
          <motion.div
            whileHover={{ scale: 1.015, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: `0 24px 64px ${feature.accent.replace(")", " / 0.14)")}, 0 4px 16px oklch(0 0 0 / 0.06)`,
              border: "1px solid oklch(0.88 0.02 285)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${feature.accent.replace(")", " / 0.08)")} 0%, transparent 60%)`,
              }}
            />
            <Image
              src={feature.image}
              alt={feature.title}
              width={900}
              height={600}
              unoptimized
              className="w-full h-auto block"
            />
          </motion.div>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ── Tech Details slide ── */
const TECH_STACK = [
  { label: "Frontend", items: ["Next.js 16 · App Router", "Tailwind CSS v4 · oklch()", "shadcn/ui", "Framer Motion"] },
  { label: "Auth & Billing", items: ["Clerk v7 · session · has()", "Clerk Billing · Free / Plus / Pro", "Lazy plan sync — no webhook"] },
  { label: "Database", items: ["Neon PostgreSQL · HTTP driver", "Drizzle ORM · type-safe queries", "6 tables · CASCADE DELETE"] },
  { label: "AI Extraction", items: ["Gemini 2.0 Flash · extractMeetingData()", "Gemini Files API · transcribeVideo()", "Structured JSON output"] },
  { label: "Background Jobs", items: ["Inngest · 6-step pipeline", "Daily cron · 9 AM IST reminders", "3 retries per step"] },
  { label: "Email & Storage", items: ["Resend · React Email templates", "Cloudinary · audio/video uploads", "Vercel · serverless deployment"] },
];

function TechDetailsSlide({ active }: { active: boolean }) {
  return (
    <Slide>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.04) 0%, oklch(0.50 0.26 240 / 0.05) 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{ width: 420, height: 420, background: "oklch(0.55 0.25 285 / 0.06)", top: "50%", left: "20%", transform: "translateY(-50%)" }}
      />

      <div className="relative h-full flex flex-col lg:flex-row items-center gap-8 lg:gap-12 px-6 sm:px-10 lg:px-16 pt-20 pb-10 max-w-7xl mx-auto w-full">

        {/* ── Image column — left, narrower ── */}
        <motion.div
          className="flex flex-shrink-0 w-full lg:w-[38%] flex-col justify-center"
          variants={imgVariant}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
        >
          <motion.div
            whileHover={{ scale: 1.015, y: -4 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 24px 64px oklch(0.52 0.28 300 / 0.14), 0 4px 16px oklch(0 0 0 / 0.06)",
              border: "1px solid oklch(0.88 0.02 285)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.52 0.28 300 / 0.08) 0%, transparent 60%)" }}
            />
            <Image
              src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776438453/techdetails_busywc.png"
              alt="Tech Stack Details"
              width={900}
              height={600}
              unoptimized
              className="w-full h-auto block"
            />
          </motion.div>
        </motion.div>

        {/* ── Text column — right, wider ── */}
        <motion.div
          className="flex-1 min-w-0 flex flex-col justify-center"
          variants={textContainer}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div variants={textItem} className="mb-3">
            <span
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: "oklch(0.52 0.28 300 / 0.08)",
                border: "1px solid oklch(0.52 0.28 300 / 0.28)",
                color: "oklch(0.40 0.22 300)",
              }}
            >
              Tech Stack
            </span>
          </motion.div>

          <motion.h2
            variants={textItem}
            className="text-2xl sm:text-3xl font-bold leading-tight mb-2"
            style={{ color: "oklch(0.22 0.04 285)" }}
          >
            Built on a Modern,{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.72 0.20 75) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Production-Grade Stack
            </span>
          </motion.h2>

          <motion.p
            variants={textItem}
            className="text-sm leading-relaxed mb-5"
            style={{ color: "oklch(0.44 0.06 285)" }}
          >
            Every layer chosen for reliability and zero-config scalability.
          </motion.p>

          {/* 3-col × 2-row grid — fits in one viewport height */}
          <motion.div variants={textItem} className="grid grid-cols-3 gap-2.5">
            {TECH_STACK.map((group) => (
              <div
                key={group.label}
                className="rounded-xl px-3.5 py-3"
                style={{
                  background: "oklch(0.96 0.008 285 / 0.70)",
                  border: "1px solid oklch(0.88 0.02 285)",
                }}
              >
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ color: "oklch(0.40 0.20 285)" }}
                >
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <p
                    key={item}
                    className="text-[11px] leading-snug mb-0.5"
                    style={{ color: "oklch(0.46 0.06 285)" }}
                  >
                    · {item}
                  </p>
                ))}
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </Slide>
  );
}

/* ── CTA slide ── */
function CtaSlide({ active }: { active: boolean }) {
  return (
    <Slide>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(135deg, oklch(0.52 0.28 300 / 0.05) 0%, oklch(0.80 0.17 75 / 0.07) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{ width: 500, height: 500, background: "oklch(0.55 0.25 285 / 0.06)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-16">
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate={active ? "visible" : "hidden"}
          className="max-w-2xl"
        >
          <motion.span
            variants={textItem}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            style={{
              background: "oklch(0.945 0.012 285)",
              border: "1px solid oklch(0.88 0.02 285)",
              color: "oklch(0.44 0.10 285)",
            }}
          >
            <CheckCircle2 size={12} strokeWidth={2.5} />
            All 8 features explored
          </motion.span>

          <motion.h2
            variants={textItem}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            style={{ color: "oklch(0.22 0.04 285)" }}
          >
            Ready to turn your next meeting into{" "}
            <span
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.72 0.20 75) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              action?
            </span>
          </motion.h2>

          <motion.p
            variants={textItem}
            className="text-base leading-relaxed mb-10"
            style={{ color: "oklch(0.44 0.06 285)" }}
          >
            Start for free — no credit card required. Upgrade when your team grows.
          </motion.p>

          <motion.div variants={textItem} className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "linear-gradient(135deg, oklch(0.48 0.26 300), oklch(0.55 0.25 285))",
                color: "oklch(0.985 0.006 90)",
                boxShadow: "0 4px 20px oklch(0.52 0.28 300 / 0.30)",
              }}
            >
              Start Free <ArrowRight size={16} strokeWidth={2.2} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold transition-all duration-200 hover:scale-[1.03]"
              style={{
                background: "oklch(0.80 0.17 75 / 0.18)",
                border: "1.5px solid oklch(0.80 0.17 75 / 0.45)",
                color: "oklch(0.32 0.10 75)",
              }}
            >
              View Pricing
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </Slide>
  );
}

/* ── Main page ── */
export default function FeaturesPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  // Keep ref in sync
  useEffect(() => { currentRef.current = current; }, [current]);

  const goTo = useCallback((i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.offsetWidth, behavior: "smooth" });
  }, []);

  // Track scroll position → update current index
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const idx = Math.round(el.scrollLeft / el.offsetWidth);
      setCurrent(idx);
    };
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(Math.min(TOTAL - 1, currentRef.current + 1));
      if (e.key === "ArrowLeft") goTo(Math.max(0, currentRef.current - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo]);

  const isFirst = current === 0;
  const isLast = current === TOTAL - 1;

  return (
    <>
      {/* Hide horizontal scrollbar globally for this page */}
      <style>{`
        .features-scroll::-webkit-scrollbar { display: none; }
        .features-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="fixed inset-0 overflow-hidden" style={{ background: "oklch(0.985 0.006 90)" }}>

        {/* ── Scrollable slides ── */}
        <div
          ref={scrollRef}
          className="features-scroll flex h-full w-full overflow-x-scroll"
          style={{ scrollSnapType: "x mandatory" }}
        >
          <HeroSlide active={current === 0} />
          {FEATURES.map((f, i) => (
            <FeatureSlide key={f.number} feature={f} active={current === i + 1} />
          ))}
          <TechDetailsSlide active={current === TOTAL - 2} />
          <CtaSlide active={current === TOTAL - 1} />
        </div>

        {/* ── Prev arrow ── */}
        <AnimatePresence>
          {!isFirst && (
            <motion.button
              key="prev"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => goTo(Math.max(0, current - 1))}
              aria-label="Previous"
              className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: "oklch(0.985 0.006 90 / 0.85)",
                border: "1px solid oklch(0.88 0.02 285)",
                boxShadow: "0 4px 20px oklch(0.55 0.25 285 / 0.12)",
                backdropFilter: "blur(8px)",
                color: "oklch(0.40 0.12 285)",
              }}
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Next arrow ── */}
        <AnimatePresence>
          {!isLast && (
            <motion.button
              key="next"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={() => goTo(Math.min(TOTAL - 1, current + 1))}
              aria-label="Next"
              className="fixed right-4 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: "oklch(0.985 0.006 90 / 0.85)",
                border: "1px solid oklch(0.88 0.02 285)",
                boxShadow: "0 4px 20px oklch(0.55 0.25 285 / 0.12)",
                backdropFilter: "blur(8px)",
                color: "oklch(0.40 0.12 285)",
              }}
            >
              <ChevronRight size={20} strokeWidth={2} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Home button (top-left) ── */}
        <Link
          href="/"
          className="fixed top-20 left-6 z-40 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 hover:scale-105"
          style={{
            background: "oklch(0.985 0.006 90 / 0.85)",
            border: "1px solid oklch(0.88 0.02 285)",
            boxShadow: "0 4px 16px oklch(0.55 0.25 285 / 0.10)",
            backdropFilter: "blur(8px)",
            color: "oklch(0.44 0.12 285)",
          }}
        >
          <Home size={13} strokeWidth={2.2} />
          Home
        </Link>

        {/* ── Slide counter (top-right) — features + tech slide only ── */}
        {current > 0 && current < TOTAL - 1 && (
          <div
            className="fixed top-20 right-6 z-40 font-mono text-xs font-semibold tabular-nums px-3 py-1.5 rounded-full"
            style={{
              background: "oklch(0.985 0.006 90 / 0.80)",
              border: "1px solid oklch(0.88 0.02 285)",
              backdropFilter: "blur(8px)",
              color: "oklch(0.50 0.08 285)",
            }}
          >
            {current === TOTAL - 2 ? (
              <span style={{ color: "oklch(0.40 0.20 285)", fontWeight: 700 }}>Tech Stack</span>
            ) : (
              <>
                <span style={{ color: "oklch(0.40 0.20 285)", fontWeight: 700 }}>
                  {String(current).padStart(2, "0")}
                </span>
                {" "}/ {String(FEATURES.length).padStart(2, "0")}
              </>
            )}
          </div>
        )}

        {/* ── Progress dots (bottom center) ── */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 28 : 7,
                height: 7,
                background:
                  i === current
                    ? "linear-gradient(90deg, oklch(0.48 0.26 300), oklch(0.72 0.20 75))"
                    : "oklch(0.75 0.04 285)",
                opacity: i === current ? 1 : 0.5,
              }}
            />
          ))}
        </div>

      </div>
    </>
  );
}
