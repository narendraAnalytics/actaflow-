import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { meetings, actionItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const { userId } = await auth();

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, userId!))
    .orderBy(desc(meetings.createdAt));

  // Count total action items across all meetings
  const allItems = userMeetings.length
    ? await db
        .select()
        .from(actionItems)
        .where(eq(actionItems.userId, userId!))
    : [];

  const stats = {
    totalMeetings: userMeetings.length,
    totalActionItems: allItems.length,
    doneItems: allItems.filter((i) => i.status === 'done').length,
  };

  return <DashboardClient meetings={userMeetings} stats={stats} />;
}
