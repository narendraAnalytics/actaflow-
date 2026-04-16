import { inngest } from '@/inngest/client';
import { db } from '@/db';
import { meetings, attendees, actionItems, emailLogs, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { extractMeetingData, transcribeVideo, type GeminiAttendee } from '@/lib/gemini';
import { sendActionItemEmail } from '@/lib/email';
import { PLAN_LIMITS, type PlanKey } from '@/lib/plans';

export const processMeeting = inngest.createFunction(
  {
    id: 'process-meeting',
    name: 'Process Meeting',
    retries: 3,
    triggers: [{ event: 'actaflow/meeting.uploaded' }],
  },
  async ({ event, step }: { event: { data: { meetingId: string; userId: string; attendeeEmails: string[]; mimeType?: string } }; step: any }) => {
    const { meetingId, userId, attendeeEmails } = event.data;

    try {
      // Step 1: Mark as processing
      await step.run('update-status-processing', async () => {
        await db
          .update(meetings)
          .set({ status: 'processing' })
          .where(eq(meetings.id, meetingId));
      });

      // Fetch user plan for downstream enforcement
      const userPlan = await step.run('fetch-user-plan', async () => {
        const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1);
        return (user?.plan ?? 'free') as PlanKey;
      });

      // Step 2: Transcribe (if audio/video upload) then call Gemini
      const extraction = await step.run('call-gemini', async () => {
        const [meeting] = await db
          .select()
          .from(meetings)
          .where(eq(meetings.id, meetingId))
          .limit(1);

        if (!meeting) throw new Error('Meeting not found: ' + meetingId);

        let transcript = meeting.rawTranscript;

        // For upload-sourced meetings, transcribe from Cloudinary URL first
        if (!transcript && meeting.audioUrl) {
          const response = await fetch(meeting.audioUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch audio from Cloudinary: ${response.status}`);
          }
          const buffer = Buffer.from(await response.arrayBuffer());
          const mimeType = event.data.mimeType ?? 'video/mp4';

          transcript = await transcribeVideo(buffer, mimeType, `meeting-${meetingId}`);

          // Persist immediately — idempotent on retry
          await db
            .update(meetings)
            .set({ rawTranscript: transcript })
            .where(eq(meetings.id, meetingId));
        }

        if (!transcript) {
          throw new Error('No transcript found for meeting: ' + meetingId);
        }

        return extractMeetingData(transcript);
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

        // Insert attendees — match emails positionally, then transcript-extracted, then fuzzy
        const insertedAttendees = [];
        // Build a name→resolvedEmail map so action item owners can reuse the same resolution
        const resolvedEmailMap = new Map<string, string>();

        for (let i = 0; i < extraction.attendees.length; i++) {
          const attendee = extraction.attendees[i];
          const email = resolveEmail(attendee, i, attendeeEmails);
          if (email) resolvedEmailMap.set(attendee.name.toLowerCase().trim(), email);

          const [inserted] = await db
            .insert(attendees)
            .values({ meetingId, name: attendee.name, email: email ?? null })
            .returning();

          insertedAttendees.push(inserted);
        }

        // Insert action items
        for (const item of extraction.action_items) {
          // Check resolved attendee map first (covers transcript-extracted emails)
          const ownerEmail =
            resolvedEmailMap.get(item.owner.toLowerCase().trim()) ??
            resolveEmailByName(item.owner, attendeeEmails);

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

      // Step 4: Send emails (capped by plan's maxAttendeeEmails)
      await step.run('send-emails', async () => {
        const items = await db
          .select()
          .from(actionItems)
          .where(eq(actionItems.meetingId, meetingId));

        const planLimit = PLAN_LIMITS[userPlan as PlanKey].maxAttendeeEmails;
        // Only email attendees who have an email address, capped at plan limit
        const eligibleAttendees = savedAttendees
          .filter((a: { email: string | null }) => !!a.email)
          .slice(0, planLimit === Infinity ? undefined : planLimit);

        for (const attendee of eligibleAttendees) {
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
 * 3-tier email resolution for an attendee:
 * 1. Form field email at same position (explicit user override — highest priority)
 * 2. Email extracted from transcript by Gemini
 * 3. Fuzzy first-name → email local-part match against form field emails
 */
function resolveEmail(
  attendee: GeminiAttendee,
  index: number,
  emailList: string[]
): string | undefined {
  if (emailList[index]) return emailList[index];
  if (attendee.email) return attendee.email;
  return resolveEmailByName(attendee.name, emailList);
}

/**
 * Match an owner name against form-field emails by comparing first name
 * to the local-part of each email address.
 */
function resolveEmailByName(
  ownerName: string,
  emailList: string[]
): string | undefined {
  if (!emailList.length) return undefined;

  const firstName = ownerName.split(' ')[0].toLowerCase();

  return emailList.find((email) => {
    const localPart = email.split('@')[0].toLowerCase();
    return localPart.includes(firstName) || firstName.includes(localPart.split('.')[0]);
  });
}
