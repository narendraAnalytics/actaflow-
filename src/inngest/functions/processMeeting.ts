import { inngest } from '@/inngest/client';
import { db } from '@/db';
import { meetings, attendees, actionItems, emailLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractMeetingData } from '@/lib/gemini';
import { sendActionItemEmail } from '@/lib/email';

export const processMeeting = inngest.createFunction(
  {
    id: 'process-meeting',
    name: 'Process Meeting',
    retries: 3,
    triggers: [{ event: 'actaflow/meeting.uploaded' }],
  },
  async ({ event, step }: { event: { data: { meetingId: string; userId: string; attendeeEmails: string[] } }; step: any }) => {
    const { meetingId, userId, attendeeEmails } = event.data;

    try {
      // Step 1: Mark as processing
      await step.run('update-status-processing', async () => {
        await db
          .update(meetings)
          .set({ status: 'processing' })
          .where(eq(meetings.id, meetingId));
      });

      // Step 2: Call Gemini
      const extraction = await step.run('call-gemini', async () => {
        const [meeting] = await db
          .select()
          .from(meetings)
          .where(eq(meetings.id, meetingId))
          .limit(1);

        if (!meeting?.rawTranscript) {
          throw new Error('No transcript found for meeting: ' + meetingId);
        }

        return extractMeetingData(meeting.rawTranscript);
      });

      // Step 3: Save extracted data
      const savedAttendees = await step.run('save-extraction', async () => {
        // Update the meeting row
        await db
          .update(meetings)
          .set({
            title: extraction.title,
            summary: extraction.summary,
            decisions: extraction.decisions,
            blockers: extraction.blockers,
            meetingDate: extraction.meeting_date,
            durationMins: extraction.duration_mins,
            language: extraction.language,
          })
          .where(eq(meetings.id, meetingId));

        // Insert attendees — match emails positionally or by fuzzy name
        const insertedAttendees = [];
        for (let i = 0; i < extraction.attendees.length; i++) {
          const name = extraction.attendees[i];
          const email = resolveEmail(name, i, attendeeEmails);

          const [inserted] = await db
            .insert(attendees)
            .values({ meetingId, name, email: email ?? null })
            .returning();

          insertedAttendees.push(inserted);
        }

        // Insert action items
        for (const item of extraction.action_items) {
          const ownerEmail = resolveEmailByName(item.owner, extraction.attendees, attendeeEmails);

          await db.insert(actionItems).values({
            meetingId,
            userId,
            ownerName: item.owner,
            ownerEmail: ownerEmail ?? null,
            description: item.description,
            dueDate: item.due_date,
            priority: item.priority,
            status: 'open',
          });
        }

        return insertedAttendees;
      });

      // Step 4: Send emails
      await step.run('send-emails', async () => {
        const items = await db
          .select()
          .from(actionItems)
          .where(eq(actionItems.meetingId, meetingId));

        for (const attendee of savedAttendees) {
          if (!attendee.email) continue;

          // Filter action items owned by this attendee
          const attendeeItems = items.filter(
            (item) =>
              item.ownerName.toLowerCase().trim() ===
              attendee.name.toLowerCase().trim()
          );

          if (attendeeItems.length === 0) continue;

          try {
            const { emailId } = await sendActionItemEmail({
              to: attendee.email,
              attendeeName: attendee.name,
              meetingTitle: extraction.title,
              meetingDate: extraction.meeting_date,
              summary: extraction.summary,
              decisions: extraction.decisions,
              actionItems: attendeeItems.map((item) => ({
                id: item.id,
                description: item.description,
                dueDate: item.dueDate,
                priority: item.priority as 'high' | 'medium' | 'low',
                context: undefined,
                doneToken: item.doneToken,
              })),
            });

            // Log email
            await db.insert(emailLogs).values({
              meetingId,
              attendeeId: attendee.id,
              resendEmailId: emailId,
              status: 'sent',
            });

            // Mark attendee email sent
            await db
              .update(attendees)
              .set({ emailSent: true, emailSentAt: new Date() })
              .where(eq(attendees.id, attendee.id));
          } catch (emailErr) {
            console.error(`[processMeeting] Email failed for ${attendee.email}:`, emailErr);
            await db.insert(emailLogs).values({
              meetingId,
              attendeeId: attendee.id,
              status: 'failed',
            });
          }
        }
      });

      // Step 5: Mark done
      await step.run('update-status-done', async () => {
        await db
          .update(meetings)
          .set({ status: 'done' })
          .where(eq(meetings.id, meetingId));
      });
    } catch (err) {
      console.error('[processMeeting] Pipeline failed:', err);
      await db
        .update(meetings)
        .set({ status: 'failed' })
        .where(eq(meetings.id, meetingId));
      throw err;
    }
  }
);

/* ── Helpers ── */

/**
 * Positional match: Gemini attendee[i] → user-provided email[i].
 * Falls back to fuzzy name→email-local-part comparison.
 */
function resolveEmail(
  name: string,
  index: number,
  emailList: string[]
): string | undefined {
  if (emailList[index]) return emailList[index];
  return resolveEmailByName(name, [], emailList);
}

/**
 * Match an owner name against provided emails by comparing first name
 * to the local-part of each email address.
 */
function resolveEmailByName(
  ownerName: string,
  _allNames: string[],
  emailList: string[]
): string | undefined {
  if (!emailList.length) return undefined;

  const firstName = ownerName.split(' ')[0].toLowerCase();

  return emailList.find((email) => {
    const localPart = email.split('@')[0].toLowerCase();
    return localPart.includes(firstName) || firstName.includes(localPart.split('.')[0]);
  });
}
