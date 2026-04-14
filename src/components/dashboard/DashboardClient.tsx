'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus,
  Calendar,
  Users,
  CheckSquare,
  Clock,
  ChevronRight,
  FileText,
  Zap,
  TrendingUp,
} from 'lucide-react';
import type { Meeting } from '@/db/schema';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface DashboardClientProps {
  meetings: Meeting[];
  stats: {
    totalMeetings: number;
    totalActionItems: number;
    doneItems: number;
  };
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'processing') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: 'oklch(0.80 0.17 75 / 0.15)', color: 'oklch(0.44 0.14 75)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Processing
      </span>
    );
  }
  if (status === 'done') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{ background: 'oklch(0.55 0.25 285 / 0.1)', color: 'oklch(0.52 0.28 300)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.52 0.28 300)' }} />
        Done
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: 'oklch(0.65 0.22 25 / 0.12)', color: 'oklch(0.50 0.20 25)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      Failed
    </span>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: EASE },
  }),
};

export default function DashboardClient({ meetings, stats }: DashboardClientProps) {
  const completionRate =
    stats.totalActionItems > 0
      ? Math.round((stats.doneItems / stats.totalActionItems) * 100)
      : 0;

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: 'oklch(0.22 0.04 285)' }}
          >
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'oklch(0.50 0.06 285)' }}>
            Your meetings and action items at a glance.
          </p>
        </div>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          style={{
            background: 'oklch(0.52 0.28 300)',
            color: 'oklch(0.985 0.006 90)',
            boxShadow: '0 4px 16px oklch(0.55 0.25 285 / 0.28)',
          }}
        >
          <Plus size={16} />
          New Meeting
        </Link>
      </motion.div>

      {/* Stats row */}
      {stats.totalMeetings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Meetings', value: stats.totalMeetings, icon: FileText },
            { label: 'Action Items', value: stats.totalActionItems, icon: CheckSquare },
            { label: 'Completion Rate', value: `${completionRate}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-5"
              style={{
                background: 'oklch(1 0.004 90)',
                border: '1px solid oklch(0.88 0.02 285)',
                boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.05)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ background: 'oklch(0.55 0.25 285 / 0.1)' }}
              >
                <Icon size={16} style={{ color: 'oklch(0.52 0.28 300)' }} />
              </div>
              <div
                className="text-2xl font-bold mb-0.5"
                style={{ color: 'oklch(0.22 0.04 285)' }}
              >
                {value}
              </div>
              <div className="text-xs font-medium" style={{ color: 'oklch(0.50 0.06 285)' }}>
                {label}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {meetings.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: 'oklch(0.55 0.25 285 / 0.1)' }}
          >
            <Zap size={28} style={{ color: 'oklch(0.52 0.28 300)' }} />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'oklch(0.22 0.04 285)' }}
          >
            No meetings yet
          </h2>
          <p
            className="text-sm max-w-sm mb-8"
            style={{ color: 'oklch(0.50 0.06 285)', lineHeight: '1.6' }}
          >
            Paste a transcript or drop in a recording — every attendee gets their action
            items emailed automatically.
          </p>
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
            style={{
              background: 'oklch(0.52 0.28 300)',
              color: 'oklch(0.985 0.006 90)',
              boxShadow: '0 6px 24px oklch(0.55 0.25 285 / 0.30)',
            }}
          >
            <Plus size={16} />
            Analyse Your First Meeting
          </Link>
        </motion.div>
      )}

      {/* Meeting list */}
      {meetings.length > 0 && (
        <div>
          <h2
            className="text-sm font-semibold mb-4"
            style={{ color: 'oklch(0.50 0.06 285)', letterSpacing: '0.05em' }}
          >
            RECENT MEETINGS
          </h2>
          <div className="space-y-3">
            {meetings.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Link
                  href={`/dashboard/${meeting.id}`}
                  className="group flex items-center justify-between p-5 rounded-xl transition-all duration-200 hover:shadow-md"
                  style={{
                    background: 'oklch(1 0.004 90)',
                    border: '1px solid oklch(0.88 0.02 285)',
                    boxShadow: '0 2px 8px oklch(0.55 0.25 285 / 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      'oklch(0.70 0.18 285)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 4px 20px oklch(0.55 0.25 285 / 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor =
                      'oklch(0.88 0.02 285)';
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 2px 8px oklch(0.55 0.25 285 / 0.05)';
                  }}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'oklch(0.55 0.25 285 / 0.1)' }}
                    >
                      <FileText size={18} style={{ color: 'oklch(0.52 0.28 300)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3
                          className="font-semibold truncate text-sm"
                          style={{ color: 'oklch(0.22 0.04 285)' }}
                        >
                          {meeting.title ?? 'Untitled Meeting'}
                        </h3>
                        <StatusBadge status={meeting.status} />
                      </div>
                      <div className="flex items-center gap-4">
                        {meeting.meetingDate && (
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: 'oklch(0.50 0.06 285)' }}
                          >
                            <Calendar size={11} />
                            {meeting.meetingDate}
                          </span>
                        )}
                        {meeting.durationMins && (
                          <span
                            className="flex items-center gap-1 text-xs"
                            style={{ color: 'oklch(0.50 0.06 285)' }}
                          >
                            <Clock size={11} />
                            {meeting.durationMins} min
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: 'oklch(0.50 0.06 285)' }}
                        >
                          <Users size={11} />
                          {meeting.source}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="shrink-0 ml-3 transition-transform group-hover:translate-x-0.5"
                    style={{ color: 'oklch(0.70 0.10 285)' }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
