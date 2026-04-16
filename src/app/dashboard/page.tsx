import { db } from '@/db';
import { meetings, actionItems } from '@/db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { getOrCreateUser } from '@/lib/auth';
import { PLAN_LIMITS, getMonthStart, type PlanKey, type PlanInfo } from '@/lib/plans';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await getOrCreateUser();

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, user.id))
    .orderBy(desc(meetings.createdAt));

  // Count total action items across all meetings
  const allItems = userMeetings.length
    ? await db
        .select()
        .from(actionItems)
        .where(eq(actionItems.userId, user.id))
    : [];

  const stats = {
    totalMeetings: userMeetings.length,
    totalActionItems: allItems.length,
    doneItems: allItems.filter((i) => i.status === 'done').length,
  };

  // Monthly usage for plan banner
  const monthStart = getMonthStart();
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(meetings)
    .where(and(eq(meetings.userId, user.id), gte(meetings.createdAt, monthStart)));

  const meetingsThisMonth = row?.count ?? 0;
  const limits = PLAN_LIMITS[user.plan as PlanKey];

  const planInfo: PlanInfo = {
    plan: user.plan as PlanKey,
    meetingsThisMonth,
    meetingLimit: limits.meetingsPerMonth,
    maxAttendeeEmails: limits.maxAttendeeEmails,
    isAtLimit:
      limits.meetingsPerMonth !== Infinity && meetingsThisMonth >= limits.meetingsPerMonth,
    isUnlimited: limits.meetingsPerMonth === Infinity,
  };

  return <DashboardClient meetings={userMeetings} stats={stats} planInfo={planInfo} />;
}
