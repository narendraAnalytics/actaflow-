import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/db/schema';

/**
 * Returns the DB user for the currently signed-in Clerk user.
 * Creates the row on first call — no webhook needed.
 */
export async function getOrCreateUser(): Promise<User> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Clerk user not found');

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const fullName =
    clerkUser.username ??
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    null;

  const [created] = await db
    .insert(users)
    .values({ id: userId, email, fullName })
    .returning();

  return created;
}
