'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Plus,
  Zap,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/new', label: 'New Meeting', icon: Plus, exact: false },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-full"
      style={{
        background: 'oklch(0.975 0.008 285)',
        borderRight: '1px solid oklch(0.88 0.02 285)',
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-5 transition-opacity hover:opacity-80"
        style={{ borderBottom: '1px solid oklch(0.88 0.02 285)' }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'oklch(0.52 0.28 300)' }}
        >
          <Zap size={16} color="oklch(0.985 0.006 90)" fill="oklch(0.985 0.006 90)" />
        </div>
        <span
          className="text-base font-bold tracking-tight"
          style={{ color: 'oklch(0.22 0.04 285)' }}
        >
          ActaFlow
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                isActive
                  ? {
                      background: 'oklch(0.52 0.28 300)',
                      color: 'oklch(0.985 0.006 90)',
                    }
                  : {
                      color: 'oklch(0.40 0.06 285)',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    'oklch(0.945 0.012 285)';
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'oklch(0.22 0.04 285)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'oklch(0.40 0.06 285)';
                }
              }}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div
        className="px-4 py-4 flex items-center gap-3"
        style={{ borderTop: '1px solid oklch(0.88 0.02 285)' }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
        <span className="text-xs font-medium" style={{ color: 'oklch(0.50 0.06 285)' }}>
          My Account
        </span>
      </div>
    </aside>
  );
}
