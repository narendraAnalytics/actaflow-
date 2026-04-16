'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { LayoutDashboard, Plus, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/new', label: 'New Meeting', icon: Plus, exact: false },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const displayName = user?.username ?? user?.firstName ?? 'You';

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-full"
      style={{
        background: 'oklch(0.972 0.010 285)',
        borderRight: '1px solid oklch(0.88 0.02 285)',
      }}
    >
      {/* ── Brand ── */}
      <Link
        href="/"
        className="flex items-center gap-3 px-5 py-5 transition-opacity hover:opacity-80"
        style={{ borderBottom: '1px solid oklch(0.88 0.02 285)' }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.62 0.22 280) 100%)',
            boxShadow: '0 4px 14px oklch(0.52 0.28 300 / 0.35)',
          }}
        >
          <Zap size={17} color="oklch(0.985 0.006 90)" fill="oklch(0.985 0.006 90)" />
        </div>
        <span
          className="text-base font-extrabold tracking-tight"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.22 0.04 285) 0%, oklch(0.48 0.26 295) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          ActaFlow
        </span>
      </Link>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, oklch(0.52 0.28 300) 0%, oklch(0.60 0.22 280) 100%)',
                      color: 'oklch(0.985 0.006 90)',
                      boxShadow: '0 4px 14px oklch(0.52 0.28 300 / 0.30)',
                    }
                  : {
                      color: 'oklch(0.42 0.08 285)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    'oklch(0.55 0.25 285 / 0.08)';
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'oklch(0.28 0.08 285)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'oklch(0.42 0.08 285)';
                }
              }}
            >
              <Icon size={16} />
              {label}

              {/* New meeting pill indicator */}
              {href === '/dashboard/new' && !isActive && (
                <span
                  className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: 'oklch(0.80 0.17 75 / 0.20)',
                    color: 'oklch(0.44 0.14 75)',
                  }}
                >
                  +
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Upgrade nudge (decorative) ── */}
      <div className="px-3 pb-3">
        <div
          className="rounded-xl p-3.5 text-center"
          style={{
            background:
              'linear-gradient(135deg, oklch(0.55 0.25 285 / 0.08) 0%, oklch(0.80 0.17 75 / 0.06) 100%)',
            border: '1px solid oklch(0.55 0.25 285 / 0.12)',
          }}
        >
          <div
            className="text-xs font-bold mb-0.5"
            style={{ color: 'oklch(0.40 0.12 285)' }}
          >
            ActaFlow AI
          </div>
          <div
            className="text-xs leading-snug"
            style={{ color: 'oklch(0.55 0.06 285)' }}
          >
            Auto-extracts action items from every meeting
          </div>
        </div>
      </div>

      {/* ── User ── */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid oklch(0.88 0.02 285)' }}
      >
        <UserButton
          appearance={{
            elements: { avatarBox: 'w-8 h-8' },
          }}
        />
        <div className="min-w-0">
          <div
            className="text-sm font-semibold truncate"
            style={{ color: 'oklch(0.28 0.06 285)' }}
          >
            {displayName}
          </div>
          <div
            className="text-xs"
            style={{ color: 'oklch(0.55 0.06 285)' }}
          >
            My Account
          </div>
        </div>
      </div>
    </aside>
  );
}
