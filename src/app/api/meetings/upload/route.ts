import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { meetings } from '@/db/schema';
import { inngest } from '@/inngest/client';
import { getOrCreateUser } from '@/lib/auth';
import { uploadVideoToCloudinary } from '@/lib/cloudinary';
import { nanoid } from 'nanoid';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const attendeeEmailsRaw = (formData.get('attendeeEmails') as string) ?? '';
  const preExtractedTranscript = (formData.get('transcript') as string) || null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
    return NextResponse.json(
      { error: 'Only audio and video files are supported' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds the 100 MB size limit' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  await getOrCreateUser();

  const emailList = attendeeEmailsRaw
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.includes('@'));

  // Upload to Cloudinary for storage / playback
  const cloudinaryUrl = await uploadVideoToCloudinary(buffer, `meeting-${nanoid(12)}`);

  // If transcript was pre-extracted in the browser step, store it now.
  // processMeeting will skip transcription and go straight to extractMeetingData.
  const [meeting] = await db
    .insert(meetings)
    .values({
      userId,
      source: 'upload',
      rawTranscript: preExtractedTranscript,
      audioUrl: cloudinaryUrl,
      title: null,
      status: 'processing',
    })
    .returning();

  // Fire Inngest event — includes mimeType so processMeeting knows the codec
  await inngest.send({
    name: 'actaflow/meeting.uploaded',
    data: {
      meetingId: meeting.id,
      userId,
      attendeeEmails: emailList,
      mimeType: file.type,
    },
  });

  return NextResponse.json({ meetingId: meeting.id }, { status: 201 });
}
