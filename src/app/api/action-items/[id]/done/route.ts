import { NextResponse } from 'next/server';
import { db } from '@/db';
import { actionItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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

  await db
    .update(actionItems)
    .set({ status: 'done', doneAt: new Date() })
    .where(eq(actionItems.id, id));

  return NextResponse.redirect(`${appUrl}/?done=success`);
}
