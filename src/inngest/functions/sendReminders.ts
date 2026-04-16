import { inngest } from '@/inngest/client';
import { db } from '@/db';
import { actionItems, meetings, users } from '@/db/schema';
import { eq, and, isNull, isNotNull, lte, or } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email';
import { isThisMonth } from '@/lib/plans';

type ReminderItem = {
  id: string;
  description: string;
  dueDate: string | null;
  priority: string;
  doneToken: string;
  ownerEmail: string | null;
  ownerName: string;
  meetingId: string;
  meetingTitle: string | null;
  userId: string;
  userPlan: string;
  userReminderMonthSentAt: Date | null;
};

export const sendReminders = inngest.createFunction(
  {
    id: 'send-reminders',
    name: 'Send Daily Reminders',
    retries: 2,
    triggers: [{ cron: '30 3 * * *' }], // 9:00 AM IST (UTC+5:30)
  },
  async ({ step }: { step: any }) => {
    // Step 1: Fetch all open items that need a reminder (join users for plan data)
    const dueItems: ReminderItem[] = await step.run('fetch-due-items', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayStr = today.toISOString().slice(0, 10);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const rows = await db
        .select({
          id: actionItems.id,
          description: actionItems.description,
          dueDate: actionItems.dueDate,
          priority: actionItems.priority,
          doneToken: actionItems.doneToken,
          ownerEmail: actionItems.ownerEmail,
          ownerName: actionItems.ownerName,
          meetingId: actionItems.meetingId,
          meetingTitle: meetings.title,
          userId: actionItems.userId,
          userPlan: users.plan,
          userReminderMonthSentAt: users.reminderMonthSentAt,
        })
        .from(actionItems)
        .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
        .innerJoin(users, eq(actionItems.userId, users.id))
        .where(
          and(
            eq(actionItems.status, 'open'),
            isNotNull(actionItems.ownerEmail),
            isNotNull(actionItems.dueDate),
            isNull(actionItems.reminderSentAt),
            or(
              // Due today or overdue
              lte(actionItems.dueDate, todayStr),
              // High priority due tomorrow
              and(
                eq(actionItems.priority, 'high'),
                eq(actionItems.dueDate, tomorrowStr)
              )
            )
          )
        );

      return rows;
    });

    if (dueItems.length === 0) return { sent: 0 };

    // Step 2: Apply free-plan monthly cap, then send one email per attendee
    await step.run('send-reminder-emails', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);

      // Group by userId to apply per-user free-plan monthly cap
      const byUser = new Map<string, ReminderItem[]>();
      for (const item of dueItems) {
        const list = byUser.get(item.userId) ?? [];
        list.push(item);
        byUser.set(item.userId, list);
      }

      // Collect items allowed to send (free users already sent this month are skipped)
      const allowedItems: ReminderItem[] = [];
      for (const [, items] of byUser) {
        const { userPlan, userReminderMonthSentAt } = items[0];
        if (userPlan === 'free') {
          // Free plan: only one reminder batch per calendar month
          if (userReminderMonthSentAt && isThisMonth(userReminderMonthSentAt)) {
            continue; // already sent this month — skip all items for this user
          }
        }
        allowedItems.push(...items);
      }

      if (allowedItems.length === 0) return;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

      // Group allowed items by ownerEmail and send
      const grouped = new Map<string, ReminderItem[]>();
      for (const item of allowedItems) {
        if (!item.ownerEmail) continue;
        const existing = grouped.get(item.ownerEmail) ?? [];
        existing.push(item);
        grouped.set(item.ownerEmail, existing);
      }

      for (const [email, items] of grouped) {
        const hasOverdue = items.some(
          (item: ReminderItem) => item.dueDate !== null && item.dueDate < todayStr
        );
        const type: 'overdue' | 'reminder' = hasOverdue ? 'overdue' : 'reminder';
        const attendeeName = items[0].ownerName;
        const meetingTitle = items[0].meetingTitle ?? 'your meeting';

        try {
          await sendReminderEmail({
            to: email,
            attendeeName,
            meetingTitle,
            type,
            actionItems: items.map((item: ReminderItem) => ({
              id: item.id,
              description: item.description,
              dueDate: item.dueDate,
              priority: item.priority as 'high' | 'medium' | 'low',
              doneToken: item.doneToken,
            })),
            appUrl,
          });

          // Mark reminderSentAt on all items for this attendee
          for (const item of items) {
            await db
              .update(actionItems)
              .set({ reminderSentAt: new Date() })
              .where(eq(actionItems.id, item.id));
          }

          // For free-plan users: stamp reminderMonthSentAt so they don't get another this month
          if (items[0].userPlan === 'free') {
            await db
              .update(users)
              .set({ reminderMonthSentAt: new Date() })
              .where(eq(users.id, items[0].userId));
          }
        } catch (err) {
          // Log and continue — don't fail the whole job for one bad email
          console.error(`Failed to send reminder to ${email}:`, err);
        }
      }
    });

    return { sent: dueItems.length };
  }
);
