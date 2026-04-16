import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { processMeeting } from '@/inngest/functions/processMeeting';
import { sendReminders } from '@/inngest/functions/sendReminders';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processMeeting, sendReminders],
});
