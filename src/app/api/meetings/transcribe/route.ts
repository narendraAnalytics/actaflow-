import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { transcribeVideo } from '@/lib/gemini';

export const maxDuration = 120; // transcription can take up to 2 min
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
  const transcript = await transcribeVideo(buffer, file.type, file.name);

  // Extract emails from transcript (same regex as the paste flow)
  const EMAIL_RE = /[\w.+\-]+@[\w\-]+\.[\w.]+/g;
  const emails = Array.from(new Set(transcript.match(EMAIL_RE) ?? []));

  return NextResponse.json({ transcript, emails });
}
