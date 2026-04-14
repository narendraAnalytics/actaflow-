import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { meetings, attendees, actionItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(and(eq(meetings.id, id), eq(meetings.userId, userId)))
    .limit(1);

  if (!meeting) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const meetingAttendees = await db
    .select()
    .from(attendees)
    .where(eq(attendees.meetingId, id));

  const items = await db
    .select()
    .from(actionItems)
    .where(eq(actionItems.meetingId, id));

  return NextResponse.json({ meeting, attendees: meetingAttendees, actionItems: items });
}
