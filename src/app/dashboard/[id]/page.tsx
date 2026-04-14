import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { meetings, attendees, actionItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import MeetingDetailClient from '@/components/dashboard/MeetingDetailClient';

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.userId, userId!)))
    .limit(1);

  if (!meeting) notFound();

  const meetingAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.meetingId, id));

  const items = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.meetingId, id));

  return (
    <MeetingDetailClient
      initialMeeting={meeting}
      initialAttendees={meetingAttendees}
      initialActionItems={items}
      meetingId={id}
    />
  );
}
