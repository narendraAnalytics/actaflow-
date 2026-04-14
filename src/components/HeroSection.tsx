"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Play,
  CheckCircle2,
  Zap,
  ArrowRight,
  Calendar,
} from "lucide-react";

/* ── Animation variants ── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: EASE },
  }),
};

const floatIn = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.5 + i * 0.12, duration: 0.6, ease: EASE },
  }),
};

const floatLoop = {
  y: [0, -8, 0],
  transition: { repeat: Infinity, duration: 3.2, ease: "easeInOut" as const },
};

/* ── Tiny avatar component ── */
function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0"
      style={{ background: color, color: "oklch(0.985 0.006 90)" }}
    >
      {initials}
    </span>
  );
}

/* ── Social proof avatars ── */
const teamAvatars = [
  { initials: "AK", color: "oklch(0.52 0.28 300)" },
  { initials: "SR", color: "oklch(0.62 0.22 285)" },
  { initials: "MJ", color: "oklch(0.80 0.17 75)" },
];

const SARAH_GIF =
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776083794/gamer_12764339_usrash.gif";

const HERO_BG =
  "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776083797/herosectionbackgroundimage1_tu367t.png";

export default function HeroSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const { user, isSignedIn } = useUser();
  const displayName = user?.username ?? user?.firstName ?? "there";

  const [count, setCount] = useState(100);
  useEffect(() => {
    if (!inView) return;
    const start = 100;
    const end = 500;
    const duration = 1800; // ms
    const startTime = performance.now();
    let raf: number;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative h-svh flex flex-col justify-center overflow-hidden"
    >
      {/* ── Background image — fills entire section incl. behind navbar ── */}
      <Image
        src={HERO_BG}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Overlay to keep text readable while honouring the palette */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.985 0.006 90 / 0.82) 0%, oklch(0.975 0.010 285 / 0.70) 50%, oklch(0.88 0.04 285 / 0.55) 100%)",
        }}
      />

      {/* ── Signed-in welcome — absolute bottom-center ── */}
      <AnimatePresence>
        {isSignedIn && (
          <motion.div
            key="welcome-banner"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="absolute bottom-6 left-12 right-0 z-10 flex justify-center px-4"
          >
            <div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
              style={{
                
              }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: "oklch(0.52 0.28 300)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.45 0.10 285)" }}
              >
                Welcome back,{" "}
                <span className="font-bold" style={{ color: "oklch(0.52 0.28 300)" }}>
                  {displayName}
                </span>{" "}
                — ready to turn your next meeting into action?
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amber glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[10%] bottom-[15%] w-72 h-72 opacity-20 rounded-full blur-3xl"
        style={{ background: "oklch(0.80 0.17 75)" }}
      />

      {/* ── Content — pt-20 clears the fixed navbar ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 flex flex-col items-start max-w-xl">
            {/* Eyebrow badge */}
            <motion.div
              custom={0}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
            >
              <span
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6"
                style={{
                  background: "oklch(0.80 0.17 75 / 0.22)",
                  color: "oklch(0.38 0.14 75)",
                  border: "1px solid oklch(0.80 0.17 75 / 0.40)",
                }}
              >
                <Zap size={12} className="shrink-0" />
                AI-Powered Meeting Intelligence
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="font-extrabold leading-[1.1] tracking-tight mb-5"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                letterSpacing: "-0.03em",
              }}
            >
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.46 0.26 300) 0%, oklch(0.50 0.27 300) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                From Discussion
              </span>
              <br />
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.50 0.27 300) 0%, oklch(0.58 0.25 300) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                to{" "}
              </span>
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.58 0.27 300) 0%, oklch(0.70 0.22 300) 50%, oklch(0.80 0.17 75) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Execution
              </span>
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.80 0.17 75) 0%, oklch(0.70 0.20 300) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ,
              </span>
              <br />
              <span
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.52 0.28 300) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Instantly.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={2}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="text-base leading-relaxed mb-8"
              style={{
                color: "oklch(0.42 0.10 285)",
                maxWidth: "36ch",
                lineHeight: "1.7",
              }}
            >
              Drop in a recording or paste a transcript — every attendee
              receives only their action items, with deadlines and priorities,
              in under&nbsp;2&nbsp;minutes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={3}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
                style={{
                  background: "oklch(0.52 0.28 300)",
                  color: "oklch(0.985 0.006 90)",
                  boxShadow: "0 6px 24px oklch(0.55 0.25 285 / 0.35)",
                }}
              >
                Get Started Free
                <ArrowRight size={15} />
              </Link>

              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
                style={{
                  border: "1.5px solid oklch(0.55 0.25 285 / 0.4)",
                  color: "oklch(0.50 0.22 285)",
                  background: "oklch(0.985 0.006 90 / 0.6)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "oklch(0.985 0.006 90 / 0.85)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "oklch(0.985 0.006 90 / 0.6)")
                }
              >
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full"
                  style={{ background: "oklch(0.55 0.25 285 / 0.15)" }}
                >
                  <Play size={10} fill="currentColor" />
                </span>
                Watch Demo
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              custom={4}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              variants={fadeUp}
              className="flex items-center gap-3"
            >
              <div className="flex -space-x-2">
                {teamAvatars.map((a, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ring-2 ring-white/60"
                    style={{
                      background: a.color,
                      color: "oklch(0.985 0.006 90)",
                    }}
                  >
                    {a.initials}
                  </span>
                ))}
              </div>
              <p className="text-sm" style={{ color: "oklch(0.45 0.10 285)" }}>
                <span
                  className="font-semibold"
                  style={{ color: "oklch(0.38 0.18 285)" }}
                >
                  {count}+ teams
                </span>{" "}
                already executing faster
              </p>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — Visual Mockup ── */}
          <div className="flex-1 relative flex items-center justify-center w-full lg:w-auto">
            <div className="relative w-full max-w-[520px] min-h-[420px] lg:min-h-[500px]">

              {/* ── LAPTOP FRAME — Meeting Summary ── */}
              <motion.div
                custom={0}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={floatIn}
                className="absolute inset-x-4 top-4"
              >
                {/* Outer laptop container */}
                <div className="relative">

                  {/* ── SCREEN LID ── */}
                  <div
                    className="rounded-t-2xl rounded-b-sm overflow-hidden"
                    style={{
                      background: "linear-gradient(160deg, oklch(0.86 0.06 285) 0%, oklch(0.80 0.08 285) 100%)",
                      border: "1.5px solid oklch(0.72 0.10 285)",
                      borderBottom: "none",
                      boxShadow:
                        "0 -2px 12px oklch(0.55 0.25 285 / 0.10) inset, 0 20px 60px oklch(0.55 0.25 285 / 0.20)",
                      padding: "10px 10px 0px 10px",
                    }}
                  >
                    {/* Top bezel — camera */}
                    <div className="flex items-center justify-center h-5 mb-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "oklch(0.58 0.14 285)" }}
                      />
                    </div>

                    {/* Screen viewport */}
                    <div
                      className="rounded-t-lg overflow-hidden"
                      style={{
                        background: "oklch(0.985 0.006 90)",
                        maxHeight: "268px",
                        overflowY: "auto",
                        scrollbarWidth: "none",
                      }}
                    >
                      {/* ── Screen content — Meeting Summary ── */}
                      <div className="p-4">
                        {/* Card header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-5 h-5 rounded-full inline-flex items-center justify-center"
                              style={{ background: "oklch(0.55 0.25 285 / 0.12)" }}
                            >
                              <ArrowRight size={10} style={{ color: "oklch(0.52 0.28 300)" }} />
                            </span>
                            <span
                              className="font-semibold text-xs"
                              style={{ color: "oklch(0.38 0.18 285)" }}
                            >
                              Meeting Summary
                            </span>
                          </div>
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: "oklch(0.80 0.17 75 / 0.15)",
                              color: "oklch(0.44 0.14 75)",
                            }}
                          >
                            Just now
                          </span>
                        </div>

                        {/* Key Decisions */}
                        <p className="text-[10px] font-semibold mb-1.5 tracking-wide" style={{ color: "oklch(0.50 0.06 285)" }}>
                          KEY DECISIONS
                        </p>
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {[
                            { icon: "🎯", label: "Q3 Launch" },
                            { icon: "📊", label: "Budget +15%" },
                            { icon: "✅", label: "Hire 3 FTEs" },
                          ].map((d) => (
                            <span
                              key={d.label}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                              style={{
                                background: "oklch(0.945 0.012 285)",
                                color: "oklch(0.38 0.14 285)",
                              }}
                            >
                              {d.icon} {d.label}
                            </span>
                          ))}
                        </div>

                        {/* Action Items */}
                        <p className="text-[10px] font-semibold mb-1.5 tracking-wide" style={{ color: "oklch(0.50 0.06 285)" }}>
                          ACTION ITEMS
                        </p>
                        <div className="space-y-1.5">
                          {[
                            { name: "Sarah K.", task: "Update Q3 roadmap deck", priority: "High" },
                            { name: "Marcus J.", task: "Send budget proposal", priority: "Med" },
                            { name: "Priya R.", task: "Schedule interviews", priority: "Low" },
                          ].map((item) => (
                            <div
                              key={item.name}
                              className="flex items-center gap-2 p-1.5 rounded-lg"
                              style={{ background: "oklch(0.975 0.008 285)" }}
                            >
                              <Avatar
                                initials={item.name.split(" ").map((n) => n[0]).join("")}
                                color={item.priority === "High" ? "oklch(0.52 0.28 300)" : "oklch(0.80 0.17 75)"}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-semibold truncate" style={{ color: "oklch(0.38 0.18 285)" }}>
                                  {item.name}
                                </p>
                                <p className="text-[10px] truncate" style={{ color: "oklch(0.50 0.06 285)" }}>
                                  {item.task}
                                </p>
                              </div>
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                                style={
                                  item.priority === "High"
                                    ? { background: "oklch(0.55 0.25 285 / 0.12)", color: "oklch(0.43 0.24 300)" }
                                    : item.priority === "Med"
                                    ? { background: "oklch(0.80 0.17 75 / 0.15)", color: "oklch(0.44 0.14 75)" }
                                    : { background: "oklch(0.945 0.012 285)", color: "oklch(0.50 0.06 285)" }
                                }
                              >
                                {item.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* ── End screen content ── */}
                    </div>
                  </div>

                  {/* ── HINGE LINE ── */}
                  <div
                    style={{
                      height: "3px",
                      background: "linear-gradient(90deg, oklch(0.72 0.10 285) 0%, oklch(0.65 0.12 285) 50%, oklch(0.72 0.10 285) 100%)",
                    }}
                  />

                  {/* ── KEYBOARD BASE ── */}
                  <div
                    style={{
                      background: "linear-gradient(180deg, oklch(0.88 0.05 285) 0%, oklch(0.84 0.06 285) 100%)",
                      border: "1.5px solid oklch(0.75 0.08 285)",
                      borderTop: "none",
                      borderRadius: "0 0 0.5rem 0.5rem",
                      height: "22px",
                      clipPath: "polygon(0% 0%, 100% 0%, 97% 100%, 3% 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Touchpad */}
                    <div
                      style={{
                        width: "52px",
                        height: "10px",
                        borderRadius: "3px",
                        background: "oklch(0.80 0.07 285)",
                        border: "1px solid oklch(0.72 0.09 285)",
                        marginTop: "2px",
                      }}
                    />
                  </div>

                </div>
              </motion.div>

              {/* Floating badge — Due Tomorrow */}
              <motion.div
                custom={1}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={floatIn}
              >
                <motion.div
                  animate={floatLoop}
                  className="absolute -left-2 top-[38%] flex items-center gap-2 px-3.5 py-2.5 rounded-2xl shadow-lg"
                  style={{
                    background: "oklch(0.80 0.17 75)",
                    boxShadow: "0 8px 24px oklch(0.80 0.17 75 / 0.35)",
                  }}
                >
                  <Calendar size={14} style={{ color: "oklch(0.38 0.18 285)" }} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.38 0.18 285)" }}
                  >
                    Due Tomorrow
                  </span>
                </motion.div>
              </motion.div>

              {/* Floating card — Your Action Items checklist */}
              <motion.div
                custom={2}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={floatIn}
              >
                <motion.div
                  animate={{ y: [0, -6, 0], transition: { repeat: Infinity, duration: 4, ease: "easeInOut" as const } }}
                  className="absolute -right-4 bottom-6 w-52 rounded-2xl p-4 shadow-xl"
                  style={{
                    background: "oklch(1 0.004 90 / 0.95)",
                    border: "1px solid oklch(0.88 0.02 285)",
                    boxShadow: "0 16px 40px oklch(0.55 0.25 285 / 0.14), 0 2px 8px oklch(0.55 0.25 285 / 0.07)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <p
                    className="text-xs font-bold mb-3"
                    style={{ color: "oklch(0.38 0.18 285)" }}
                  >
                    Your Action Items
                  </p>
                  {[
                    "Update the presentation",
                    "Follow up with client",
                    "Check project status",
                  ].map((task) => (
                    <div key={task} className="flex items-center gap-2 mb-2 last:mb-0">
                      <CheckCircle2
                        size={13}
                        style={{ color: "oklch(0.52 0.28 300)", flexShrink: 0 }}
                      />
                      <span
                        className="text-xs leading-snug"
                        style={{ color: "oklch(0.38 0.14 285)" }}
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Floating badge — Assigned to Sarah K. (gif avatar) */}
              <motion.div
                custom={3}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={floatIn}
              >
                <motion.div
                  animate={{ y: [0, -5, 0], transition: { repeat: Infinity, duration: 3.6, ease: "easeInOut" as const, delay: 0.8 } }}
                  className="absolute right-8 top-2 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-md"
                  style={{
                    background: "oklch(0.975 0.010 285 / 0.95)",
                    border: "1px solid oklch(0.88 0.02 285)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {/* Sarah gif avatar */}
                  <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[oklch(0.80_0.17_75/0.5)] block">
                    <Image
                      src={SARAH_GIF}
                      alt="Sarah K."
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </span>
                  <div>
                    <p
                      className="text-[10px] leading-none mb-0.5"
                      style={{ color: "oklch(0.50 0.06 285)" }}
                    >
                      Assigned to
                    </p>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.38 0.18 285)" }}
                    >
                      Sarah K.
                    </p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating icon badge — Time Management gif (top-left, mirrors Sarah K. top-right) */}
              <motion.div
                custom={4}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                variants={floatIn}
              >
                <motion.div
                  animate={{ y: [0, -7, 0], transition: { repeat: Infinity, duration: 4.4, ease: "easeInOut" as const, delay: 0.4 } }}
                  className="absolute left-4 top-2 flex items-center gap-2 px-3 py-2 rounded-2xl shadow-md"
                  style={{
                    background: "oklch(0.975 0.010 285 / 0.95)",
                    border: "1px solid oklch(0.88 0.02 285)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <span className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-[oklch(0.55_0.25_285/0.4)] block">
                    <Image
                      src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776084949/time-management_17688171_nh4fxd.gif"
                      alt="Time Management"
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </span>
                  <div>
                    <p className="text-[10px] leading-none mb-0.5" style={{ color: "oklch(0.50 0.06 285)" }}>
                      Deadline
                    </p>
                    <p className="text-xs font-semibold" style={{ color: "oklch(0.38 0.18 285)" }}>
                      On Track
                    </p>
                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>
          {/* ── END RIGHT COLUMN ── */}
        </div>
      </div>
    </section>
  );
}
