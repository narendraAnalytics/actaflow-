'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  CheckSquare,
  MessageSquare,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import type { Meeting, Attendee, ActionItem } from '@/db/schema';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface MeetingDetailClientProps {
  initialMeeting: Meeting;
  initialAttendees: Attendee[];
  initialActionItems: ActionItem[];
  meetingId: string;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const priorityConfig = {
  high: {
    label: 'High',
    bg: 'oklch(0.55 0.25 285 / 0.1)',
    color: 'oklch(0.52 0.28 300)',
    border: 'oklch(0.55 0.25 285 / 0.35)',
    dot: 'oklch(0.52 0.28 300)',
  },
  medium: {
    label: 'Medium',
    bg: 'oklch(0.80 0.17 75 / 0.12)',
    color: 'oklch(0.44 0.14 75)',
    border: 'oklch(0.80 0.17 75 / 0.40)',
    dot: 'oklch(0.65 0.16 75)',
  },
  low: {
    label: 'Low',
    bg: 'oklch(0.945 0.012 285)',
    color: 'oklch(0.50 0.06 285)',
    border: 'oklch(0.82 0.04 285)',
    dot: 'oklch(0.65 0.06 285)',
  },
};

export default function MeetingDetailClient({
  initialMeeting,
  initialAttendees,
  initialActionItems,
  meetingId,
}: MeetingDetailClientProps) {
  const [meeting, setMeeting] = useState(initialMeeting);
  const [attendeeList, setAttendeeList] = useState(initialAttendees);
  const [items, setItems] = useState(initialActionItems);

  // Poll every 3 seconds while processing
  useEffect(() => {
    if (meeting.status !== 'processing') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) return;
        const data = (await res.json()) as {
          meeting: Meeting;
          attendees: Attendee[];
          actionItems: ActionItem[];
        };
        setMeeting(data.meeting);
        setAttendeeList(data.attendees);
        setItems(data.actionItems);

        if (data.meeting.status !== 'processing') {
          clearInterval(interval);
        }
      } catch {
        // silently retry
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [meeting.status, meetingId]);

  const decisions = (meeting.decisions as string[] | null) ?? [];
  const blockers = (meeting.blockers as string[] | null) ?? [];

  /* ── Processing state ── */
  if (meeting.status === 'processing') {
    return (
      <div className="p-8 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'oklch(0.50 0.06 285)' }}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, oklch(0.55 0.25 285 / 0.08) 0%, oklch(0.80 0.17 75 / 0.06) 100%)',
            border: '1px solid oklch(0.70 0.18 285 / 0.25)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'oklch(0.52 0.28 300)' }}
          >
            <Loader2 size={28} color="white" className="animate-spin" />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'oklch(0.22 0.04 285)' }}
          >
            ActaFlow is analysing your meeting…
          </h2>
          <p className="text-sm mb-6" style={{ color: 'oklch(0.50 0.06 285)' }}>
            Gemini is extracting action items, decisions, and owners. Usually ready in 30–60 seconds.
          </p>

          {/* Animated steps */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['Reading transcript', 'Extracting with AI', 'Saving results', 'Sending emails'].map(
              (label, i) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'oklch(0.55 0.25 285 / 0.1)',
                    color: 'oklch(0.52 0.28 300)',
                    animationDelay: `${i * 0.5}s`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  {label}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Failed state ── */
  if (meeting.status === 'failed') {
    return (
      <div className="p-8 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: 'oklch(0.50 0.06 285)' }}
        >
          <ArrowLeft size={15} />
          Back
        </Link>
        <div
          className="rounded-xl p-6 flex items-start gap-4"
          style={{ background: 'oklch(0.97 0.02 25)', border: '1px solid oklch(0.85 0.08 25)' }}
        >
          <AlertTriangle size={22} style={{ color: 'oklch(0.55 0.20 25)' }} className="shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-base mb-1" style={{ color: 'oklch(0.35 0.15 25)' }}>
              Processing failed
            </h2>
            <p className="text-sm" style={{ color: 'oklch(0.50 0.15 25)' }}>
              Something went wrong while analysing your transcript. Please try again with a new meeting.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'oklch(0.55 0.20 25)', color: 'white' }}
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Done state ── */
  const highCount = items.filter((i) => i.priority === 'high').length;
  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="p-8 max-w-5xl">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'oklch(0.50 0.06 285)' }}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: 'oklch(0.22 0.04 285)' }}
            >
              {meeting.title ?? 'Meeting Summary'}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {meeting.meetingDate && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'oklch(0.945 0.012 285)', color: 'oklch(0.40 0.06 285)' }}
                >
                  <Calendar size={11} />
                  {meeting.meetingDate}
                </span>
              )}
              {meeting.durationMins && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'oklch(0.945 0.012 285)', color: 'oklch(0.40 0.06 285)' }}
                >
                  <Clock size={11} />
                  {meeting.durationMins} min
                </span>
              )}
              {meeting.language && meeting.language !== 'en' && (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'oklch(0.945 0.012 285)', color: 'oklch(0.40 0.06 285)' }}
                >
                  <Globe size={11} />
                  {meeting.language.toUpperCase()}
                </span>
              )}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'oklch(0.55 0.25 285 / 0.1)', color: 'oklch(0.52 0.28 300)' }}
              >
                <CheckCircle2 size={11} />
                Done
              </span>
            </div>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3">
            <div
              className="text-center px-4 py-3 rounded-xl"
              style={{ background: 'oklch(1 0.004 90)', border: '1px solid oklch(0.88 0.02 285)' }}
            >
              <div className="text-xl font-bold" style={{ color: 'oklch(0.22 0.04 285)' }}>
                {items.length}
              </div>
              <div className="text-xs" style={{ color: 'oklch(0.50 0.06 285)' }}>
                Action Items
              </div>
            </div>
            <div
              className="text-center px-4 py-3 rounded-xl"
              style={{ background: 'oklch(1 0.004 90)', border: '1px solid oklch(0.88 0.02 285)' }}
            >
              <div className="text-xl font-bold" style={{ color: 'oklch(0.52 0.28 300)' }}>
                {doneCount}
              </div>
              <div className="text-xs" style={{ color: 'oklch(0.50 0.06 285)' }}>
                Completed
              </div>
            </div>
            {highCount > 0 && (
              <div
                className="text-center px-4 py-3 rounded-xl"
                style={{ background: 'oklch(0.55 0.25 285 / 0.08)', border: '1px solid oklch(0.55 0.25 285 / 0.2)' }}
              >
                <div className="text-xl font-bold" style={{ color: 'oklch(0.52 0.28 300)' }}>
                  {highCount}
                </div>
                <div className="text-xs" style={{ color: 'oklch(0.52 0.28 300)' }}>
                  High Priority
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Summary */}
      {meeting.summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
          className="rounded-xl p-5 mb-6"
          style={{
            background: 'oklch(1 0.004 90)',
            borderLeft: '3px solid oklch(0.52 0.28 300)',
            border: '1px solid oklch(0.88 0.02 285)',
            borderLeftWidth: '3px',
            boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.05)',
          }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'oklch(0.52 0.28 300)', letterSpacing: '0.08em' }}>
            MEETING SUMMARY
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.30 0.05 285)' }}>
            {meeting.summary}
          </p>
        </motion.div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Action Items */}
        <div className="lg:col-span-2 space-y-3">
          <h2
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'oklch(0.22 0.04 285)' }}
          >
            <CheckSquare size={15} style={{ color: 'oklch(0.52 0.28 300)' }} />
            ACTION ITEMS
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'oklch(0.55 0.25 285 / 0.1)', color: 'oklch(0.52 0.28 300)' }}
            >
              {items.length}
            </span>
          </h2>

          {items.length === 0 && (
            <div
              className="rounded-xl p-8 text-center"
              style={{ background: 'oklch(0.975 0.008 285)', border: '1px dashed oklch(0.82 0.04 285)' }}
            >
              <p className="text-sm" style={{ color: 'oklch(0.50 0.06 285)' }}>
                No action items were extracted from this meeting.
              </p>
            </div>
          )}

          {items.map((item, i) => {
            const p = priorityConfig[item.priority as keyof typeof priorityConfig] ?? priorityConfig.low;
            const ownerInitials = initials(item.ownerName);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
                className="rounded-xl p-4"
                style={{
                  background: item.status === 'done' ? 'oklch(0.97 0.004 285)' : 'oklch(1 0.004 90)',
                  border: `1px solid ${p.border}`,
                  borderLeft: `3px solid ${p.dot}`,
                  boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.04)',
                  opacity: item.status === 'done' ? 0.7 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Owner avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: p.bg, color: p.color }}
                  >
                    {ownerInitials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold mb-0.5 leading-snug"
                      style={{
                        color: 'oklch(0.22 0.04 285)',
                        textDecoration: item.status === 'done' ? 'line-through' : 'none',
                      }}
                    >
                      {item.description}
                    </p>
                    <p className="text-xs mb-2" style={{ color: 'oklch(0.55 0.06 285)' }}>
                      {item.ownerName}
                      {item.ownerEmail && ` · ${item.ownerEmail}`}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Priority */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: p.bg, color: p.color }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: p.dot }}
                        />
                        {p.label}
                      </span>

                      {/* Due date */}
                      {item.dueDate && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: 'oklch(0.945 0.012 285)',
                            color: 'oklch(0.40 0.06 285)',
                          }}
                        >
                          <Calendar size={10} />
                          {item.dueDate}
                        </span>
                      )}

                      {/* Status */}
                      {item.status === 'done' && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: 'oklch(0.55 0.25 285 / 0.1)', color: 'oklch(0.52 0.28 300)' }}
                        >
                          <CheckCircle2 size={10} />
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Decisions */}
          {decisions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15, ease: EASE }}
              className="rounded-xl p-5"
              style={{
                background: 'oklch(1 0.004 90)',
                border: '1px solid oklch(0.88 0.02 285)',
                boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.05)',
              }}
            >
              <h3
                className="text-xs font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'oklch(0.22 0.04 285)', letterSpacing: '0.06em' }}
              >
                <MessageSquare size={13} style={{ color: 'oklch(0.52 0.28 300)' }} />
                DECISIONS
              </h3>
              <ul className="space-y-2">
                {decisions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: 'oklch(0.52 0.28 300)' }}
                    />
                    <span className="text-sm leading-snug" style={{ color: 'oklch(0.30 0.05 285)' }}>
                      {d}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Blockers */}
          {blockers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: EASE }}
              className="rounded-xl p-5"
              style={{
                background: 'oklch(0.97 0.02 75)',
                border: '1px solid oklch(0.85 0.08 75)',
              }}
            >
              <h3
                className="text-xs font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'oklch(0.44 0.14 75)', letterSpacing: '0.06em' }}
              >
                <ShieldAlert size={13} style={{ color: 'oklch(0.60 0.16 75)' }} />
                BLOCKERS
              </h3>
              <ul className="space-y-2">
                {blockers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: 'oklch(0.65 0.16 75)' }}
                    />
                    <span className="text-sm leading-snug" style={{ color: 'oklch(0.35 0.10 75)' }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Attendees */}
          {attendeeList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25, ease: EASE }}
              className="rounded-xl p-5"
              style={{
                background: 'oklch(1 0.004 90)',
                border: '1px solid oklch(0.88 0.02 285)',
                boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.05)',
              }}
            >
              <h3
                className="text-xs font-semibold mb-3 flex items-center gap-2"
                style={{ color: 'oklch(0.22 0.04 285)', letterSpacing: '0.06em' }}
              >
                <Users size={13} style={{ color: 'oklch(0.52 0.28 300)' }} />
                ATTENDEES
              </h3>
              <ul className="space-y-3">
                {attendeeList.map((a) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: 'oklch(0.55 0.25 285 / 0.12)',
                        color: 'oklch(0.52 0.28 300)',
                      }}
                    >
                      {initials(a.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'oklch(0.22 0.04 285)' }}>
                        {a.name}
                      </p>
                      {a.email && (
                        <p className="text-xs truncate" style={{ color: 'oklch(0.55 0.06 285)' }}>
                          {a.email}
                        </p>
                      )}
                    </div>
                    {a.emailSent && (
                      <Mail size={13} style={{ color: 'oklch(0.52 0.28 300)' }} />
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
