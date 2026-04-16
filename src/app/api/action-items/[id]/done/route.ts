import { NextResponse } from 'next/server';
import { db } from '@/db';
import { actionItems, meetings, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendDoneNotificationEmail } from '@/lib/email';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const { id } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?done=invalid`);
  }

  const [item] = await db
    .select()
    .from(actionItems)
    .where(and(eq(actionItems.id, id), eq(actionItems.doneToken, token)))
    .limit(1);

  if (!item) {
    return NextResponse.redirect(`${appUrl}/?done=invalid`);
  }

  const doneAt = new Date();

  await db
    .update(actionItems)
    .set({ status: 'done', doneAt })
    .where(eq(actionItems.id, id));

  // Notify the meeting organiser — fire and forget (don't block the redirect)
  (async () => {
    try {
      const [meeting] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.id, item.meetingId))
        .limit(1);

      if (!meeting) return;

      const [organiser] = await db
        .select()
        .from(users)
        .where(eq(users.id, meeting.userId))
        .limit(1);

      if (!organiser?.email) return;

      await sendDoneNotificationEmail({
        to: organiser.email,
        organiserName: organiser.fullName ?? organiser.email,
        attendeeName: item.ownerName,
        itemDescription: item.description,
        meetingTitle: meeting.title ?? 'your meeting',
        meetingId: meeting.id,
        doneAt: doneAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
    } catch {
      // Swallow — notification failure must never block the attendee's redirect
    }
  })();

  return NextResponse.redirect(`${appUrl}/?done=success`);
}
