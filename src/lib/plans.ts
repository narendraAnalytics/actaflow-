export type PlanKey = 'free' | 'plus' | 'pro';

export const PLAN_LIMITS = {
  free: {
    meetingsPerMonth: 2,
    maxAttendeeEmails: 3,
    reminderFrequency: 'monthly' as const,
    label: 'Free',
  },
  plus: {
    meetingsPerMonth: 20,
    maxAttendeeEmails: Infinity,
    reminderFrequency: 'daily' as const,
    label: 'Plus',
  },
  pro: {
    meetingsPerMonth: Infinity,
    maxAttendeeEmails: Infinity,
    reminderFrequency: 'daily' as const,
    label: 'Pro',
  },
} as const satisfies Record<PlanKey, {
  meetingsPerMonth: number;
  maxAttendeeEmails: number;
  reminderFrequency: 'monthly' | 'daily';
  label: string;
}>;

export interface PlanInfo {
  plan: PlanKey;
  meetingsThisMonth: number;
  meetingLimit: number;       // Infinity for pro
  maxAttendeeEmails: number;  // Infinity for plus/pro
  isAtLimit: boolean;
  isUnlimited: boolean;       // true only for pro
}

/** Returns midnight UTC on the 1st of the current month */
export function getMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/** Returns true if the given date falls within the current calendar month */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}
