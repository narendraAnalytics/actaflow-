import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/db/schema';

/**
 * Returns the DB user for the currently signed-in Clerk user.
 * Creates the row on first call — no webhook needed.
 * Lazily syncs the plan from Clerk on every call so upgrades/downgrades
 * take effect without a webhook.
 */
export async function getOrCreateUser(): Promise<User> {
  const { userId, has } = await auth();
  if (!userId) throw new Error('Unauthenticated');

  // Determine current Clerk plan
  const clerkPlan = has({ plan: 'pro' }) ? 'pro' : has({ plan: 'plus' }) ? 'plus' : 'free';

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existing[0]) {
    // Lazy sync: update DB if plan changed in Clerk
    if (existing[0].plan !== clerkPlan) {
      const [synced] = await db
        .update(users)
        .set({ plan: clerkPlan })
        .where(eq(users.id, userId))
        .returning();
      return synced;
    }
    return existing[0];
  }

  // New user — create with synced plan
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error('Clerk user not found');

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? '';
  const fullName =
    clerkUser.username ??
    ([clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null);

  const [created] = await db
    .insert(users)
    .values({ id: userId, email, fullName, plan: clerkPlan })
    .returning();

  return created;
}
