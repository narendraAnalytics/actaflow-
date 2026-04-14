import { GoogleGenerativeAI } from '@google/generative-ai';
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
  "attendees": ["name1", "name2"],
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

const GeminiResponseSchema = z.object({
  title: z.string(),
  meeting_date: z.string().nullable(),
  duration_mins: z.number().nullable(),
  language: z.enum(['en', 'hi', 'es', 'fr', 'de', 'pt']).default('en'),
  summary: z.string(),
  attendees: z.array(z.string()),
  decisions: z.array(z.string()),
  blockers: z.array(z.string()),
  action_items: z.array(ActionItemSchema),
});

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
