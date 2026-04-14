import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { meetings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userMeetings = await db
    .select()
    .from(meetings)
    .where(eq(meetings.userId, userId))
    .orderBy(desc(meetings.createdAt));

  return NextResponse.json({ meetings: userMeetings });
}
