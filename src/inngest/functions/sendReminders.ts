import { inngest } from '@/inngest/client';
import { db } from '@/db';
import { actionItems, meetings } from '@/db/schema';
import { eq, and, isNull, isNotNull, lte, or } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email';

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
};

export const sendReminders = inngest.createFunction(
  {
    id: 'send-reminders',
    name: 'Send Daily Reminders',
    retries: 2,
    triggers: [{ cron: '0 8 * * *' }],
  },
  async ({ step }: { step: any }) => {
    // Step 1: Fetch all open items that need a reminder
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
        })
        .from(actionItems)
        .innerJoin(meetings, eq(actionItems.meetingId, meetings.id))
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

    // Step 2: Group by ownerEmail and send one email per attendee
    await step.run('send-reminder-emails', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().slice(0, 10);

      // Group items by ownerEmail
      const grouped = new Map<string, ReminderItem[]>();
      for (const item of dueItems) {
        if (!item.ownerEmail) continue;
        const existing = grouped.get(item.ownerEmail) ?? [];
        existing.push(item);
        grouped.set(item.ownerEmail, existing);
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

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
        } catch (err) {
          // Log and continue — don't fail the whole job for one bad email
          console.error(`Failed to send reminder to ${email}:`, err);
        }
      }
    });

    return { sent: dueItems.length };
  }
);
