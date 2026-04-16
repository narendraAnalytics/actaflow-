import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager, FileState } from '@google/generative-ai/server';
import { z } from 'zod';

const SYSTEM_PROMPT = `You are ActaFlow, an expert meeting analyst. Your job is to extract structured information from meeting transcripts or recordings with precision and consistency.

OUTPUT RULES:
- Always respond with ONLY valid JSON. No markdown, no preamble, no explanation.
- Never add fields not in the schema below.
- If information is not present in the transcript, use null - never guess or fabricate.

JSON SCHEMA TO FOLLOW EXACTLY:
{
  "title": "string - meeting topic inferred from content",
  "meeting_date": "YYYY-MM-DD or null",
  "duration_mins": number_or_null,
  "language": "en | hi | es | fr | de | pt",
  "summary": "3-5 sentence plain-English recap of the meeting",
  "attendees": [
    { "name": "string - attendee name as spoken", "email": "email@domain.com or null if not found" }
  ],
  "decisions": ["decision1", "decision2"],
  "blockers": ["blocker1"],
  "action_items": [
    {
      "owner": "exact name as spoken in the transcript",
      "description": "clear, complete task description",
      "due_date": "YYYY-MM-DD or null if not mentioned",
      "priority": "high | medium | low",
      "context": "1 sentence explaining why this task was assigned"
    }
  ]
}

PRIORITY RULES:
- high: explicit deadline within 48 hours, or marked as urgent/critical/blocker
- medium: deadline within 1-2 weeks, or important to project progress
- low: no deadline mentioned, or nice-to-have / exploratory task

ATTENDEE EMAIL EXTRACTION:
- For each attendee, look for their email anywhere in the transcript — in parentheses next to their name (e.g. "Alice Smith (alice@co.com)"), after a colon, in a speaker label, or in the attendee list header.
- If found, include it in the "email" field. If not found, set "email" to null.
- Never fabricate emails. Only extract what is explicitly present in the transcript.

EXTRACTION RULES:
- Extract ALL action items - do not summarise or combine separate tasks into one.
- If ownership is unclear, use "Team" as the owner name.
- Relative dates (e.g. "by Friday") should be resolved relative to meeting_date if known.
- Include context for each action item - it helps the recipient understand why.
- Decisions are outcomes agreed upon, not tasks. Keep them separate from action items.`;

const ActionItemSchema = z.object({
  owner: z.string(),
  description: z.string(),
  due_date: z.string().nullable(),
  priority: z.enum(['high', 'medium', 'low']),
  context: z.string(),
});

const GeminiAttendeeSchema = z.object({
  name: z.string(),
  email: z.string().nullable(),
});

const GeminiResponseSchema = z.object({
  title: z.string(),
  meeting_date: z.string().nullable(),
  duration_mins: z.number().nullable(),
  language: z.enum(['en', 'hi', 'es', 'fr', 'de', 'pt']).default('en'),
  summary: z.string(),
  attendees: z.array(GeminiAttendeeSchema),
  decisions: z.array(z.string()),
  blockers: z.array(z.string()),
  action_items: z.array(ActionItemSchema),
});

export type GeminiAttendee = z.infer<typeof GeminiAttendeeSchema>;
export type GeminiExtractionResult = z.infer<typeof GeminiResponseSchema>;

export async function extractMeetingData(
  transcript: string
): Promise<GeminiExtractionResult> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    systemInstruction: SYSTEM_PROMPT,
  });

  const today = new Date().toISOString().split('T')[0];
  const userMessage = `Today's date is ${today}. Transcript:\n\n${transcript}`;

  const result = await model.generateContent(userMessage);
  const text = result.response.text();

  // Strip markdown code fences if Gemini wraps output
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[gemini] Failed to parse JSON. Raw response:', text);
    throw new Error('Gemini returned invalid JSON');
  }

  return GeminiResponseSchema.parse(parsed);
}

/**
 * Upload a media buffer to Gemini Files API, wait for ACTIVE state, then
 * generate a verbatim transcript of all spoken dialogue.
 */
export async function transcribeVideo(
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<string> {
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

  // Upload the buffer to Gemini Files API
  const uploadResult = await fileManager.uploadFile(
    buffer as unknown as string,
    { mimeType, displayName }
  );

  // Poll until ACTIVE (Gemini processes video asynchronously)
  let file = uploadResult.file;
  while (file.state === FileState.PROCESSING) {
    await new Promise((r) => setTimeout(r, 3000));
    file = await fileManager.getFile(file.name);
  }

  if (file.state === FileState.FAILED) {
    throw new Error(`Gemini file processing failed: ${displayName}`);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

  const result = await model.generateContent([
    { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
    {
      text: `This is a meeting recording. Provide a full transcript of all spoken dialogue. Preserve speaker identification where possible using format "Speaker Name: dialogue". Include all spoken content without summarising. Start directly with the transcript.`,
    },
  ]);

  const transcript = result.response.text().trim();
  if (!transcript) throw new Error('Gemini returned empty transcript');

  // Clean up uploaded file to avoid quota accumulation
  await fileManager.deleteFile(file.name).catch(() => {});

  return transcript;
}
