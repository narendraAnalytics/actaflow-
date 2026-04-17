import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { meetings } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { inngest } from '@/inngest/client';
import { getOrCreateUser } from '@/lib/auth';
import { PLAN_LIMITS, getMonthStart, type PlanKey } from '@/lib/plans';

const CreateMeetingSchema = z.object({
  transcript: z.string().min(50, 'Transcript must be at least 50 characters'),
  attendeeEmails: z.string().optional().default(''),
  title: z.string().optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = CreateMeetingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Validation failed' },
      { status: 400 }
    );
  }

  const { transcript, attendeeEmails, title } = parsed.data;

  // Sync plan from Clerk + get user
  const user = await getOrCreateUser();
  const limits = PLAN_LIMITS[user.plan as PlanKey];

  // Enforce monthly meeting limit
  if (limits.meetingsPerMonth !== Infinity) {
    const monthStart = getMonthStart();
    const [row] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(meetings)
      .where(and(eq(meetings.userId, user.id), gte(meetings.createdAt, monthStart)));
    if ((row?.count ?? 0) >= limits.meetingsPerMonth) {
      return NextResponse.json({ error: 'MEETING_LIMIT_REACHED' }, { status: 403 });
    }
  }

  // Parse and enforce attendee email limit
  const emailList = attendeeEmails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.includes('@'));

  const cappedEmailList =
    limits.maxAttendeeEmails !== Infinity
      ? emailList.slice(0, limits.maxAttendeeEmails)
      : emailList;

  // Insert meeting record
  const [meeting] = await db
    .insert(meetings)
    .values({
      userId,
      source: 'paste',
      rawTranscript: transcript,
      title: title ?? null,
      status: 'processing',
    })
    .returning();

  // Fire Inngest background job
  await inngest.send({
    name: 'actaflow/meeting.uploaded',
    data: {
      meetingId: meeting.id,
      userId,
      attendeeEmails: cappedEmailList,
    },
  });

  return NextResponse.json({ meetingId: meeting.id }, { status: 201 });
}
