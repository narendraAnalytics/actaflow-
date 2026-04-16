'use client';

import Link from 'next/link';
import { motion, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  Plus,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  FileText,
  Zap,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Infinity as InfinityIcon,
} from 'lucide-react';
import type { Meeting } from '@/db/schema';
import type { PlanInfo } from '@/lib/plans';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface DashboardClientProps {
  meetings: Meeting[];
  stats: {
    totalMeetings: number;
    totalActionItems: number;
    doneItems: number;
  };
  planInfo: PlanInfo;
}

/* ── Animated counter ── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        node.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  if (status === 'processing') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: 'oklch(0.80 0.17 75 / 0.15)',
          color: 'oklch(0.44 0.14 75)',
          border: '1px solid oklch(0.80 0.17 75 / 0.25)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Processing
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{
          background: 'oklch(0.55 0.25 285 / 0.1)',
          color: 'oklch(0.48 0.26 295)',
          border: '1px solid oklch(0.55 0.25 285 / 0.2)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'oklch(0.52 0.28 300)' }}
        />
        Done
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: 'oklch(0.65 0.22 25 / 0.1)',
        color: 'oklch(0.48 0.20 25)',
        border: '1px solid oklch(0.65 0.22 25 / 0.2)',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Failed
    </span>
  );
}

/* ── Stat card config ── */
const statConfig = [
  {
    label: 'Total Meetings',
    icon: FileText,
    gradient: 'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.62 0.20 280) 100%)',
    glow: '0 8px 32px oklch(0.52 0.28 300 / 0.28)',
    iconBg: 'oklch(0.985 0.006 90 / 0.2)',
  },
  {
    label: 'Action Items',
    icon: CheckSquare,
    gradient: 'linear-gradient(135deg, oklch(0.75 0.17 75) 0%, oklch(0.65 0.20 60) 100%)',
    glow: '0 8px 32px oklch(0.75 0.17 75 / 0.30)',
    iconBg: 'oklch(0.985 0.006 90 / 0.2)',
  },
  {
    label: 'Completion Rate',
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, oklch(0.58 0.22 295) 0%, oklch(0.52 0.28 285) 100%)',
    glow: '0 8px 32px oklch(0.55 0.25 285 / 0.28)',
    iconBg: 'oklch(0.985 0.006 90 / 0.2)',
  },
];

/* ── Plan Usage Banner ── */
function PlanUsageBanner({ planInfo }: { planInfo: PlanInfo }) {
  const { plan, meetingsThisMonth, meetingLimit, isAtLimit, isUnlimited } = planInfo;
  const pct = isUnlimited ? 100 : Math.min(100, Math.round((meetingsThisMonth / meetingLimit) * 100));
  const planLabel = plan === 'free' ? 'Free' : plan === 'plus' ? 'Plus' : 'Pro';

  // Pro: minimal badge
  if (isUnlimited) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
        className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'oklch(0.55 0.25 285 / 0.08)',
          border: '1px solid oklch(0.55 0.25 285 / 0.18)',
        }}
      >
        <InfinityIcon size={14} style={{ color: 'oklch(0.52 0.28 300)' }} />
        <span className="text-xs font-semibold" style={{ color: 'oklch(0.42 0.22 290)' }}>
          Pro · Unlimited meetings
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
      className="mb-8 rounded-2xl p-5"
      style={
        isAtLimit
          ? {
              background: 'oklch(0.80 0.17 75 / 0.10)',
              border: '1px solid oklch(0.80 0.17 75 / 0.28)',
            }
          : {
              background: 'oklch(1 0.004 90)',
              border: '1px solid oklch(0.88 0.02 285)',
              boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.06)',
            }
      }
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: label + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2.5">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={
                isAtLimit
                  ? { background: 'oklch(0.80 0.17 75 / 0.20)', color: 'oklch(0.40 0.14 75)' }
                  : { background: 'oklch(0.55 0.25 285 / 0.1)', color: 'oklch(0.48 0.26 295)' }
              }
            >
              {planLabel}
            </span>
            <span className="text-xs font-semibold" style={{ color: isAtLimit ? 'oklch(0.38 0.12 65)' : 'oklch(0.30 0.06 285)' }}>
              {isAtLimit
                ? `${meetingsThisMonth}/${meetingLimit} meetings this month — upgrade to continue`
                : `${meetingsThisMonth}/${meetingLimit} meetings used this month`}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'oklch(0.88 0.02 285)', maxWidth: '280px' }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="h-full rounded-full"
              style={{
                background: isAtLimit
                  ? 'linear-gradient(90deg, oklch(0.75 0.17 75) 0%, oklch(0.65 0.20 60) 100%)'
                  : 'linear-gradient(90deg, oklch(0.52 0.28 300) 0%, oklch(0.62 0.20 280) 100%)',
              }}
            />
          </div>
        </div>

        {/* Right: upgrade CTA */}
        {(plan === 'free' || plan === 'plus') && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 hover:scale-[1.03] shrink-0"
            style={{
              background: 'oklch(0.55 0.25 285)',
              color: 'oklch(0.985 0.006 90)',
              boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.25)',
            }}
          >
            {plan === 'free' ? 'Upgrade to Plus' : 'Upgrade to Pro'}
            <ChevronRight size={12} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function DashboardClient({ meetings, stats, planInfo }: DashboardClientProps) {
  const completionRate =
    stats.totalActionItems > 0
      ? Math.round((stats.doneItems / stats.totalActionItems) * 100)
      : 0;

  const statValues = [stats.totalMeetings, stats.totalActionItems, completionRate];
  const statSuffixes = ['', '', '%'];

  return (
    <div className="p-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-start justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: 'oklch(0.55 0.25 285 / 0.1)',
                color: 'oklch(0.48 0.26 295)',
                border: '1px solid oklch(0.55 0.25 285 / 0.18)',
              }}
            >
              <Sparkles size={11} />
              ActaFlow Workspace
            </span>
          </div>
          <h1
            className="text-3xl font-extrabold mb-1.5 tracking-tight"
            style={{
              background: 'linear-gradient(135deg, oklch(0.22 0.04 285) 0%, oklch(0.48 0.26 295) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.55 0.06 285)' }}>
            Your meetings and action items at a glance.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-[1.04]"
          style={{
            background: 'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.60 0.22 280) 100%)',
            color: 'oklch(0.985 0.006 90)',
            boxShadow: '0 4px 20px oklch(0.52 0.28 300 / 0.35)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              '0 8px 32px oklch(0.52 0.28 300 / 0.50)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
              '0 4px 20px oklch(0.52 0.28 300 / 0.35)';
          }}
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
          New Meeting
        </Link>
      </motion.div>

      {/* ── Plan usage banner ── */}
      <PlanUsageBanner planInfo={planInfo} />

      {/* ── Stat cards ── */}
      {stats.totalMeetings > 0 && (
        <div className="grid grid-cols-3 gap-5 mb-10">
          {statConfig.map(({ label, icon: Icon, gradient, glow, iconBg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08 * i, ease: EASE }}
              className="relative overflow-hidden rounded-2xl p-5"
              style={{ background: gradient, boxShadow: glow }}
            >
              {/* Decorative circles */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
                style={{ background: 'oklch(0.985 0.006 90 / 0.08)' }}
              />
              <div
                className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full"
                style={{ background: 'oklch(0.985 0.006 90 / 0.06)' }}
              />

              <div className="relative">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: iconBg, backdropFilter: 'blur(4px)' }}
                >
                  <Icon size={17} color="oklch(0.985 0.006 90)" />
                </div>
                <div
                  className="text-3xl font-extrabold mb-1 tracking-tight"
                  style={{ color: 'oklch(0.985 0.006 90)' }}
                >
                  <AnimatedNumber value={statValues[i]} suffix={statSuffixes[i]} />
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: 'oklch(0.985 0.006 90 / 0.75)' }}
                >
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {meetings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
            style={{
              background: 'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.75 0.17 75) 100%)',
              boxShadow: '0 12px 40px oklch(0.52 0.28 300 / 0.30)',
            }}
          >
            <Zap size={32} color="oklch(0.985 0.006 90)" fill="oklch(0.985 0.006 90)" />
          </motion.div>

          <h2
            className="text-2xl font-extrabold mb-2 tracking-tight"
            style={{ color: 'oklch(0.22 0.04 285)' }}
          >
            No meetings yet
          </h2>
          <p
            className="text-sm max-w-sm mb-8 leading-relaxed"
            style={{ color: 'oklch(0.55 0.06 285)' }}
          >
            Paste a transcript or drop in a recording — every attendee gets their action
            items emailed automatically.
          </p>

          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm font-bold transition-all duration-200 hover:scale-[1.04]"
            style={{
              background: 'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.60 0.22 280) 100%)',
              color: 'oklch(0.985 0.006 90)',
              boxShadow: '0 6px 28px oklch(0.52 0.28 300 / 0.35)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 10px 40px oklch(0.52 0.28 300 / 0.50)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                '0 6px 28px oklch(0.52 0.28 300 / 0.35)';
            }}
          >
            <Plus size={16} />
            Analyse Your First Meeting
          </Link>
        </motion.div>
      )}

      {/* ── Meeting list ── */}
      {meetings.length > 0 && (
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex items-center justify-between mb-5"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-5 rounded-full"
                style={{
                  background: 'linear-gradient(180deg, oklch(0.52 0.28 300) 0%, oklch(0.75 0.17 75) 100%)',
                }}
              />
              <h2
                className="text-sm font-bold tracking-widest uppercase"
                style={{ color: 'oklch(0.50 0.06 285)' }}
              >
                Recent Meetings
              </h2>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: 'oklch(0.55 0.25 285 / 0.08)',
                color: 'oklch(0.50 0.18 285)',
              }}
            >
              {meetings.length} total
            </span>
          </motion.div>

          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.42, delay: 0.28 + i * 0.07, ease: EASE }}
              >
                <Link
                  href={`/dashboard/${meeting.id}`}
                  className="group relative flex items-center justify-between p-5 rounded-2xl transition-all duration-200 overflow-hidden"
                  style={{
                    background: 'oklch(1 0.004 90)',
                    border: '1px solid oklch(0.88 0.02 285)',
                    boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.06)',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = 'oklch(0.68 0.18 285)';
                    el.style.boxShadow = '0 8px 32px oklch(0.52 0.28 300 / 0.14)';
                    el.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.borderColor = 'oklch(0.88 0.02 285)';
                    el.style.boxShadow = '0 2px 12px oklch(0.55 0.25 285 / 0.06)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background:
                        'linear-gradient(180deg, oklch(0.52 0.28 300) 0%, oklch(0.75 0.17 75) 100%)',
                    }}
                  />

                  <div className="flex items-center gap-4 flex-1 min-w-0 pl-1">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
                      style={{
                        background:
                          'linear-gradient(135deg, oklch(0.55 0.25 285 / 0.12) 0%, oklch(0.80 0.17 75 / 0.08) 100%)',
                        border: '1px solid oklch(0.55 0.25 285 / 0.15)',
                      }}
                    >
                      <FileText size={18} style={{ color: 'oklch(0.52 0.28 300)' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3
                          className="font-bold text-sm truncate"
                          style={{ color: 'oklch(0.22 0.04 285)' }}
                        >
                          {meeting.title ?? 'Untitled Meeting'}
                        </h3>
                        <StatusBadge status={meeting.status} />
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {meeting.meetingDate && (
                          <span
                            className="flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'oklch(0.55 0.06 285)' }}
                          >
                            <Calendar size={11} />
                            {meeting.meetingDate}
                          </span>
                        )}
                        {meeting.durationMins && (
                          <span
                            className="flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: 'oklch(0.55 0.06 285)' }}
                          >
                            <Clock size={11} />
                            {meeting.durationMins} min
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: 'oklch(0.55 0.06 285)' }}
                        >
                          <Users size={11} />
                          {meeting.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="shrink-0 ml-3 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0 -translate-x-1"
                    style={{ background: 'oklch(0.52 0.28 300 / 0.1)' }}
                  >
                    <ArrowUpRight size={14} style={{ color: 'oklch(0.52 0.28 300)' }} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
