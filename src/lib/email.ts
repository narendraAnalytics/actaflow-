import { Resend } from 'resend';
import { render } from '@react-email/render';
import ActionItemEmail from '@/emails/ActionItemEmail';
import ReminderEmail from '@/emails/ReminderEmail';
import DoneNotificationEmail from '@/emails/DoneNotificationEmail';

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

interface SendReminderEmailParams {
  to: string;
  attendeeName: string;
  meetingTitle: string;
  type: 'reminder' | 'overdue';
  actionItems: Array<{
    id: string;
    description: string;
    dueDate: string | null;
    priority: 'high' | 'medium' | 'low';
    doneToken: string;
  }>;
  appUrl: string;
}

export async function sendReminderEmail(
  params: SendReminderEmailParams
): Promise<{ emailId: string }> {
  const { to, attendeeName, meetingTitle, type, actionItems, appUrl } = params;

  const html = await render(
    ReminderEmail({ attendeeName, meetingTitle, type, actionItems, appUrl })
  );

  const fromName = process.env.RESEND_FROM_NAME ?? 'ActaFlow';
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';
  const subject =
    type === 'overdue'
      ? `Overdue: action items from ${meetingTitle} need your attention`
      : `Reminder: action items from ${meetingTitle} due soon`;

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  });

  if (error || !data) {
    throw new Error(`Resend error: ${error?.message ?? 'unknown'}`);
  }

  return { emailId: data.id };
}

interface SendDoneNotificationEmailParams {
  to: string;
  organiserName: string;
  attendeeName: string;
  itemDescription: string;
  meetingTitle: string;
  meetingId: string;
  doneAt: string;
}

export async function sendDoneNotificationEmail(
  params: SendDoneNotificationEmailParams
): Promise<{ emailId: string }> {
  const { to, organiserName, attendeeName, itemDescription, meetingTitle, meetingId, doneAt } =
    params;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const html = await render(
    DoneNotificationEmail({
      organiserName,
      attendeeName,
      itemDescription,
      meetingTitle,
      doneAt,
      meetingId,
      appUrl,
    })
  );

  const fromName = process.env.RESEND_FROM_NAME ?? 'ActaFlow';
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com';

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject: `${attendeeName} completed an action item in ${meetingTitle}`,
    html,
  });

  if (error || !data) {
    throw new Error(`Resend error: ${error?.message ?? 'unknown'}`);
  }

  return { emailId: data.id };
}
