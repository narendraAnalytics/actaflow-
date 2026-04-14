import { Resend } from 'resend';
import { render } from '@react-email/render';
import ActionItemEmail from '@/emails/ActionItemEmail';

const resend = new Resend(process.env.RESEND_API_KEY!);

interface SendActionItemEmailParams {
  to: string;
  attendeeName: string;
  meetingTitle: string;
  meetingDate: string | null;
  summary: string;
  decisions: string[];
  actionItems: Array<{
    id: string;
    description: string;
    dueDate: string | null;
    priority: 'high' | 'medium' | 'low';
    context?: string;
    doneToken: string;
  }>;
}

export async function sendActionItemEmail(
  params: SendActionItemEmailParams
): Promise<{ emailId: string }> {
  const { to, attendeeName, meetingTitle, meetingDate, summary, decisions, actionItems } = params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const html = await render(
    ActionItemEmail({
      attendeeName,
      meetingTitle,
      meetingDate,
      summary,
      decisions,
      actionItems,
      appUrl,
    })
  );

  const fromName = process.env.RESEND_FROM_NAME ?? 'ActaFlow';
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';
  const dateLabel = meetingDate ? ` — ${meetingDate}` : '';

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: `Your action items from ${meetingTitle}${dateLabel}`,
    html,
  });

  if (error || !data) {
    throw new Error(`Resend error: ${error?.message ?? 'unknown'}`);
  }

  return { emailId: data.id };
}
