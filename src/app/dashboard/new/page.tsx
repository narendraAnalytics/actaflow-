import { db } from '@/db';
import { meetings } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/auth';
import { PLAN_LIMITS, getMonthStart, type PlanKey, type PlanInfo } from '@/lib/plans';
import NewMeetingForm from '@/components/dashboard/NewMeetingForm';

export default async function NewMeetingPage() {
  const user = await getOrCreateUser();
  const limits = PLAN_LIMITS[user.plan as PlanKey];

  const monthStart = getMonthStart();
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(meetings)
    .where(and(eq(meetings.userId, user.id), gte(meetings.createdAt, monthStart)));

  const meetingsThisMonth = row?.count ?? 0;

  const planInfo: PlanInfo = {
    plan: user.plan as PlanKey,
    meetingsThisMonth,
    meetingLimit: limits.meetingsPerMonth,
    maxAttendeeEmails: limits.maxAttendeeEmails,
    isAtLimit:
      limits.meetingsPerMonth !== Infinity && meetingsThisMonth >= limits.meetingsPerMonth,
    isUnlimited: limits.meetingsPerMonth === Infinity,
  };

  return <NewMeetingForm planInfo={planInfo} />;
}
