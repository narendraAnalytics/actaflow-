import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { meetings } from '@/db/schema';
import { inngest } from '@/inngest/client';
import { getOrCreateUser } from '@/lib/auth';

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

  // Ensure user row exists in DB
  await getOrCreateUser();

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

  // Parse comma-separated emails
  const emailList = attendeeEmails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.includes('@'));

  // Fire Inngest background job
  await inngest.send({
    name: 'actaflow/meeting.uploaded',
    data: {
      meetingId: meeting.id,
      userId,
      attendeeEmails: emailList,
    },
  });

  return NextResponse.json({ meetingId: meeting.id }, { status: 201 });
}
