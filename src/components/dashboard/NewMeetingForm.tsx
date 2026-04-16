'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Loader2,
  AlertCircle,
  ChevronRight,
  FileText,
  Users,
  Mic,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import type { PlanInfo } from '@/lib/plans';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SAMPLE_TRANSCRIPT = `[2026-04-14 09:02 AM] Product Team Weekly Standup

Attendees: Jordan Rivera (jordan.rivera@techflow.io), Priya Mehta (priya.mehta@techflow.io), Marcus Chen (marcus.chen@techflow.io), Aisha Okonkwo (aisha.okonkwo@techflow.io), Sam Novak (sam.novak@techflow.io)

---

Jordan Rivera: Morning everyone. Quick show of hands — did everyone get a chance to review the Q2 launch checklist I sent out Friday?

Priya Mehta: I went through it. There are a few items in the backend section that need updating. I can take ownership of that today.

Marcus Chen: Same. I noticed the API rate limiting doc is missing. I'll write that up — should take about two hours. I can have it done by end of day today.

Jordan Rivera: Perfect. Marcus, actually I need that before 3 PM today because we're doing a pre-launch review call with the investors at 4. This is critical.

Marcus Chen: Understood. I'll prioritize that. Done by 2:30 PM.

Aisha Okonkwo: Quick update on my side — the onboarding email sequence is 80% done. I'm blocked on the final design assets from the design team. Sam, are those ready?

Sam Novak: Almost. I have two more screens left. I'll push everything to Figma by noon today.

Aisha Okonkwo: Great, then I can finish the email sequence this afternoon and we're good for the April 17th launch.

Jordan Rivera: Let's make sure we're aligned on the April 17th launch date. Confirmed by everyone?

All: Confirmed.

Jordan Rivera: Good. Priya, what about the database migration? Last week you flagged it as a risk.

Priya Mehta: I ran the migration on staging last night. It went smoothly. I'll do the final production migration on April 16th at 10 PM IST to minimise user impact. I'll need Marcus on standby in case anything goes wrong.

Marcus Chen: I'm available. I'll block my calendar from 10 PM to midnight on the 16th.

Jordan Rivera: Perfect. One more thing — we need someone to write the customer-facing release notes for the blog. Aisha, can you draft that? Publish target is April 17th morning.

Aisha Okonkwo: Sure, I'll have a draft by April 15th so we have time to review.

Jordan Rivera: And Sam — the product screenshots in the App Store listing are outdated. Can you update those to reflect the new UI?

Sam Novak: Yes. I'll get those done by April 16th.

Jordan Rivera: One blocker I want to flag — we're still waiting on App Store review approval. We submitted on April 10th, typical review is 3-5 days but we haven't heard back. This could affect the April 17th launch date. I'll follow up with Apple support today.

Priya Mehta: If we get rejected, do we have a contingency plan?

Jordan Rivera: Web version launches regardless. Mobile is a nice-to-have for launch day. The core product is web-first.

Sam Novak: I can prepare a "Coming to mobile soon" banner for the website just in case.

Jordan Rivera: Good thinking, Sam. Please do that by April 15th as well.

Marcus Chen: I also want to flag the monitoring setup — we don't have alerting configured for production yet. I'll set up PagerDuty alerts for error rate spikes and latency. I'll have that done by April 15th.

Jordan Rivera: That's critical for launch. Thanks Marcus. Alright, any other blockers?

Priya Mehta: I need sign-off on the data retention policy from legal. I sent it last week but no response yet. Jordan, can you follow up with them?

Jordan Rivera: I'll escalate that today. We need it by April 15th at the latest.

Priya Mehta: Also, the GDPR cookie banner hasn't been implemented yet. That's a legal requirement before we go live.

Jordan Rivera: Aisha, can you add that to your backlog?

Aisha Okonkwo: I'll implement the cookie banner by April 15th. It's a small task.

Jordan Rivera: Great. So to summarise our decisions today: April 17th launch is confirmed, web-first with mobile as aspirational, production migration on April 16th. Everyone clear on their action items?

All: Yes.

Jordan Rivera: Alright, let's go ship this. Talk tomorrow.

[Meeting ended at 09:31 AM]`;

const STEPS = [
  { label: 'Uploading transcript…', icon: FileText },
  { label: 'Analysing with AI…', icon: Sparkles },
  { label: 'Sending emails…', icon: Users },
];

const UPLOAD_STEPS = [
  { label: 'Uploading file to storage…', icon: Upload },
  { label: 'Transcribing audio with Gemini…', icon: Mic },
  { label: 'Analysing & sending emails…', icon: Sparkles },
];

interface NewMeetingFormProps {
  planInfo: PlanInfo;
}

export default function NewMeetingForm({ planInfo }: NewMeetingFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');

  // Paste-mode state
  const [transcript, setTranscript] = useState('');
  const [attendeeEmails, setAttendeeEmails] = useState('');
  const [autoDetectedCount, setAutoDetectedCount] = useState(0);
  const userEditedEmails = useRef(false);

  // Upload-mode state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedTranscript, setExtractedTranscript] = useState<string | null>(null);
  const [uploadEmailCount, setUploadEmailCount] = useState(0);

  // Shared submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<'meeting' | 'attendee' | null>(null);

  // Computed email count for plan limit check
  const emailCount = attendeeEmails
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.includes('@')).length;

  const showEmailWarning =
    planInfo.plan === 'free' &&
    planInfo.maxAttendeeEmails !== Infinity &&
    emailCount > planInfo.maxAttendeeEmails;

  // Auto-detect emails from transcript as user types/pastes
  useEffect(() => {
    if (userEditedEmails.current) return;
    const EMAIL_RE = /[\w.+\-]+@[\w\-]+\.[\w.]+/g;
    const found = Array.from(new Set(transcript.match(EMAIL_RE) ?? []));
    setAutoDetectedCount(found.length);
    setAttendeeEmails(found.join(', '));
  }, [transcript]);

  function handleEmailChange(value: string) {
    userEditedEmails.current = true;
    setAutoDetectedCount(0);
    setAttendeeEmails(value);
  }

  function loadSample() {
    userEditedEmails.current = false;
    setTranscript(SAMPLE_TRANSCRIPT);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLimitError(null);
    setIsSubmitting(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 800);

    try {
      const res = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, attendeeEmails }),
      });

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = (data as { error?: string }).error ?? '';
        if (code === 'MEETING_LIMIT_REACHED') { setLimitError('meeting'); setIsSubmitting(false); return; }
        if (code === 'ATTENDEE_LIMIT_EXCEEDED') { setLimitError('attendee'); setIsSubmitting(false); return; }
        throw new Error(code || 'Something went wrong');
      }

      const data = (await res.json()) as { meetingId: string };
      router.push(`/dashboard/${data.meetingId}`);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  }

  async function extractEmailsFromAudio() {
    if (!uploadFile) return;
    setIsExtracting(true);
    setError(null);
    setExtractedTranscript(null);
    setUploadEmailCount(0);
    userEditedEmails.current = false;

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const res = await fetch('/api/meetings/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Transcription failed');
      }

      const data = (await res.json()) as { transcript: string; emails: string[] };
      setExtractedTranscript(data.transcript);
      setUploadEmailCount(data.emails.length);
      setAttendeeEmails(data.emails.join(', '));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transcription failed');
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile) return;
    setError(null);
    setLimitError(null);
    setIsSubmitting(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, UPLOAD_STEPS.length - 1));
    }, 3000);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('attendeeEmails', attendeeEmails);
      if (extractedTranscript) {
        formData.append('transcript', extractedTranscript);
      }

      const res = await fetch('/api/meetings/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const code = (data as { error?: string }).error ?? '';
        if (code === 'MEETING_LIMIT_REACHED') { setLimitError('meeting'); setIsSubmitting(false); return; }
        if (code === 'ATTENDEE_LIMIT_EXCEEDED') { setLimitError('attendee'); setIsSubmitting(false); return; }
        throw new Error(code || 'Upload failed');
      }

      const data = (await res.json()) as { meetingId: string };
      router.push(`/dashboard/${data.meetingId}`);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setIsSubmitting(false);
    }
  }

  const currentSteps = activeTab === 'upload' ? UPLOAD_STEPS : STEPS;
  const planLabel = planInfo.plan === 'free' ? 'Free' : planInfo.plan === 'plus' ? 'Plus' : 'Pro';

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="mb-8"
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'oklch(0.22 0.04 285)' }}
        >
          New Meeting
        </h1>
        <p className="text-sm" style={{ color: 'oklch(0.50 0.06 285)' }}>
          Paste a transcript or upload a recording — ActaFlow extracts every action item automatically.
        </p>
      </motion.div>

      <form
        onSubmit={activeTab === 'upload' ? handleUploadSubmit : handleSubmit}
        className="space-y-5"
      >
        {/* Tab toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: EASE }}
          className="flex rounded-xl p-1"
          style={{
            background: 'oklch(0.945 0.012 285)',
            border: '1px solid oklch(0.88 0.02 285)',
          }}
        >
          <button
            type="button"
            onClick={() => !planInfo.isAtLimit && setActiveTab('paste')}
            disabled={planInfo.isAtLimit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={
              planInfo.isAtLimit
                ? { opacity: 0.4, cursor: 'not-allowed', color: 'oklch(0.50 0.06 285)' }
                : activeTab === 'paste'
                ? {
                    background: 'oklch(1 0.004 90)',
                    color: 'oklch(0.22 0.04 285)',
                    boxShadow: '0 1px 4px oklch(0.55 0.25 285 / 0.1)',
                  }
                : { color: 'oklch(0.50 0.06 285)' }
            }
          >
            <FileText size={14} />
            Paste Transcript
          </button>
          <button
            type="button"
            onClick={() => !planInfo.isAtLimit && setActiveTab('upload')}
            disabled={planInfo.isAtLimit}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={
              planInfo.isAtLimit
                ? { opacity: 0.4, cursor: 'not-allowed', color: 'oklch(0.50 0.06 285)' }
                : activeTab === 'upload'
                ? {
                    background: 'oklch(1 0.004 90)',
                    color: 'oklch(0.22 0.04 285)',
                    boxShadow: '0 1px 4px oklch(0.55 0.25 285 / 0.1)',
                  }
                : { color: 'oklch(0.50 0.06 285)' }
            }
          >
            <Mic size={14} />
            Upload Audio / Video
          </button>
        </motion.div>

        {/* Limit-reached lock banner */}
        {planInfo.isAtLimit && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="rounded-2xl p-8 text-center space-y-4"
            style={{
              background: 'oklch(0.80 0.17 75 / 0.08)',
              border: '1px solid oklch(0.80 0.17 75 / 0.25)',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
              style={{ background: 'oklch(0.80 0.17 75 / 0.18)' }}
            >
              <Lock size={24} style={{ color: 'oklch(0.44 0.14 75)' }} />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'oklch(0.28 0.08 285)' }}>
              {planLabel} plan: {planInfo.meetingsThisMonth}/{planInfo.meetingLimit} meetings used this month
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.50 0.06 285)' }}>
              {planInfo.plan === 'free'
                ? "You've used all your free meetings for April. Upgrade to Plus for 20 meetings/month, or Pro for unlimited."
                : "You've reached your Plus plan limit. Upgrade to Pro for unlimited meetings."}
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'oklch(0.55 0.25 285)',
                color: 'oklch(0.985 0.006 90)',
                boxShadow: '0 4px 20px oklch(0.55 0.25 285 / 0.30)',
              }}
            >
              <Zap size={14} />
              {planInfo.plan === 'free' ? 'Upgrade to Plus — $10/mo' : 'Upgrade to Pro — $29/mo'}
              <ChevronRight size={14} />
            </a>
          </motion.div>
        )}

        {/* Form body — hidden when at limit */}
        {!planInfo.isAtLimit && (
          <>
            {/* Transcript card — paste mode */}
            {activeTab === 'paste' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
                className="rounded-xl p-6"
                style={{
                  background: 'oklch(1 0.004 90)',
                  border: '1px solid oklch(0.88 0.02 285)',
                  boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.06)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <label
                    htmlFor="transcript"
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: 'oklch(0.22 0.04 285)' }}
                  >
                    <FileText size={15} style={{ color: 'oklch(0.52 0.28 300)' }} />
                    Meeting Transcript
                  </label>
                  <button
                    type="button"
                    onClick={loadSample}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 hover:scale-[1.02]"
                    style={{
                      background: 'oklch(0.80 0.17 75 / 0.15)',
                      color: 'oklch(0.44 0.14 75)',
                      border: '1px solid oklch(0.80 0.17 75 / 0.30)',
                    }}
                  >
                    <Sparkles size={11} />
                    Try Sample Transcript
                  </button>
                </div>

                <textarea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here…&#10;&#10;Supports Zoom, Google Meet, Teams, and any plain text format."
                  rows={16}
                  required
                  className="w-full resize-none rounded-lg px-4 py-3 text-sm outline-none transition-all duration-150 font-mono"
                  style={{
                    background: 'oklch(0.985 0.006 90)',
                    border: '1.5px solid oklch(0.88 0.02 285)',
                    color: 'oklch(0.22 0.04 285)',
                    lineHeight: '1.65',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.55 0.25 285 / 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.55 0.25 285 / 0.08)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'oklch(0.88 0.02 285)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />

                {transcript.length > 0 && (
                  <p className="mt-2 text-xs" style={{ color: 'oklch(0.50 0.06 285)' }}>
                    {transcript.split(/\s+/).filter(Boolean).length} words
                  </p>
                )}
              </motion.div>
            )}

            {/* Upload zone — upload mode */}
            {activeTab === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
                className="rounded-xl p-6"
                style={{
                  background: 'oklch(1 0.004 90)',
                  border: '1px solid oklch(0.88 0.02 285)',
                  boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.06)',
                }}
              >
                <label
                  className="text-sm font-semibold flex items-center gap-2 mb-3"
                  style={{ color: 'oklch(0.22 0.04 285)' }}
                >
                  <Mic size={15} style={{ color: 'oklch(0.52 0.28 300)' }} />
                  Meeting Recording
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  aria-label="Upload meeting recording"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      setExtractedTranscript(null);
                      setUploadEmailCount(0);
                      setAttendeeEmails('');
                      userEditedEmails.current = false;
                    }
                  }}
                />

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const dropped = e.dataTransfer.files[0];
                    if (dropped) {
                      setUploadFile(dropped);
                      setExtractedTranscript(null);
                      setUploadEmailCount(0);
                      setAttendeeEmails('');
                      userEditedEmails.current = false;
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl p-10 cursor-pointer flex flex-col items-center gap-3 transition-all duration-200"
                  style={{
                    border: `2px dashed ${isDragOver ? 'oklch(0.52 0.28 300)' : 'oklch(0.82 0.04 285)'}`,
                    background: isDragOver ? 'oklch(0.55 0.25 285 / 0.04)' : 'oklch(0.985 0.006 90)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{
                      background: isDragOver ? 'oklch(0.55 0.25 285 / 0.15)' : 'oklch(0.945 0.012 285)',
                    }}
                  >
                    <Upload
                      size={22}
                      style={{ color: isDragOver ? 'oklch(0.52 0.28 300)' : 'oklch(0.50 0.06 285)' }}
                    />
                  </div>

                  {uploadFile ? (
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: 'oklch(0.22 0.04 285)' }}>
                        {uploadFile.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'oklch(0.50 0.06 285)' }}>
                        {(uploadFile.size / (1024 * 1024)).toFixed(1)} MB · Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-semibold" style={{ color: 'oklch(0.40 0.06 285)' }}>
                        Drop your recording here
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'oklch(0.60 0.06 285)' }}>
                        or click to browse — .mp4, .mp3, .m4a, .wav · Max 100 MB
                      </p>
                    </div>
                  )}
                </div>

                {uploadFile && !extractedTranscript && (
                  <button
                    type="button"
                    onClick={extractEmailsFromAudio}
                    disabled={isExtracting}
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'oklch(0.80 0.17 75 / 0.18)',
                      color: 'oklch(0.38 0.12 75)',
                      border: '1px solid oklch(0.80 0.17 75 / 0.35)',
                    }}
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Transcribing &amp; detecting emails…
                      </>
                    ) : (
                      <>
                        <Mic size={14} />
                        Extract Emails from Recording
                      </>
                    )}
                  </button>
                )}

                {extractedTranscript && (
                  <div
                    className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: 'oklch(0.55 0.25 285 / 0.07)',
                      border: '1px solid oklch(0.55 0.25 285 / 0.2)',
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: 'oklch(0.52 0.28 300)' }} className="shrink-0" />
                    <p className="text-sm" style={{ color: 'oklch(0.30 0.06 285)' }}>
                      Transcript ready ·{' '}
                      <span className="font-semibold">
                        {uploadEmailCount} email{uploadEmailCount !== 1 ? 's' : ''} detected
                      </span>
                      {uploadEmailCount === 0 && ' — add emails below manually'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Attendee emails card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14, ease: EASE }}
              className="rounded-xl p-6"
              style={{
                background: 'oklch(1 0.004 90)',
                border: '1px solid oklch(0.88 0.02 285)',
                boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.06)',
              }}
            >
              <label
                htmlFor="emails"
                className="text-sm font-semibold flex items-center gap-2 mb-1"
                style={{ color: 'oklch(0.22 0.04 285)' }}
              >
                <Users size={15} style={{ color: 'oklch(0.52 0.28 300)' }} />
                Attendee Emails

                {autoDetectedCount > 0 && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: 'oklch(0.55 0.25 285 / 0.1)',
                      color: 'oklch(0.48 0.26 295)',
                      border: '1px solid oklch(0.55 0.25 285 / 0.2)',
                    }}
                  >
                    ✓ {autoDetectedCount} auto-detected
                  </span>
                )}

                {planInfo.plan === 'free' && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full ml-auto"
                    style={{
                      background: 'oklch(0.945 0.012 285)',
                      color: 'oklch(0.50 0.06 285)',
                    }}
                  >
                    {emailCount}/{planInfo.maxAttendeeEmails} free
                  </span>
                )}
              </label>
              <p className="text-xs mb-3" style={{ color: 'oklch(0.50 0.06 285)' }}>
                {activeTab === 'paste'
                  ? 'Emails are auto-detected from your transcript. Add here to override or supplement. Comma-separated.'
                  : 'Add attendee emails to receive personalised action item emails. Comma-separated.'}
              </p>
              <input
                id="emails"
                type="text"
                value={attendeeEmails}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="alice@company.com, bob@company.com, carol@company.com"
                className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-all duration-150"
                style={{
                  background: 'oklch(0.985 0.006 90)',
                  border: `1.5px solid ${showEmailWarning ? 'oklch(0.80 0.17 75 / 0.6)' : 'oklch(0.88 0.02 285)'}`,
                  color: 'oklch(0.22 0.04 285)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = showEmailWarning
                    ? 'oklch(0.75 0.17 75)'
                    : 'oklch(0.55 0.25 285 / 0.6)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px oklch(0.55 0.25 285 / 0.08)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = showEmailWarning
                    ? 'oklch(0.80 0.17 75 / 0.6)'
                    : 'oklch(0.88 0.02 285)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />

              {/* Free plan email limit warning */}
              <AnimatePresence>
                {showEmailWarning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 flex items-start gap-2 rounded-lg px-3 py-2.5 overflow-hidden"
                    style={{
                      background: 'oklch(0.80 0.17 75 / 0.10)',
                      border: '1px solid oklch(0.80 0.17 75 / 0.28)',
                    }}
                  >
                    <AlertCircle size={13} style={{ color: 'oklch(0.44 0.14 75)' }} className="shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed" style={{ color: 'oklch(0.38 0.10 75)' }}>
                      Free plan allows up to {planInfo.maxAttendeeEmails} attendee emails.{' '}
                      <a href="/pricing" className="underline font-semibold">Upgrade to Plus</a> for unlimited.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Limit-hit upgrade cards (shown when API returns 403 after form submit) */}
            <AnimatePresence>
              {limitError === 'meeting' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-6 flex items-start gap-4"
                  style={{
                    background: 'oklch(0.80 0.17 75 / 0.09)',
                    border: '1px solid oklch(0.80 0.17 75 / 0.28)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'oklch(0.80 0.17 75 / 0.20)' }}
                  >
                    <Lock size={18} style={{ color: 'oklch(0.44 0.14 75)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1" style={{ color: 'oklch(0.28 0.08 285)' }}>
                      {planInfo.plan === 'free' ? 'Free' : 'Plus'} plan meeting limit reached
                    </p>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'oklch(0.50 0.06 285)' }}>
                      You've used {planInfo.meetingsThisMonth}/{planInfo.meetingLimit} meetings this month.{' '}
                      {planInfo.plan === 'free'
                        ? 'Upgrade to Plus for 20 meetings/month.'
                        : 'Upgrade to Pro for unlimited meetings.'}
                    </p>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 hover:scale-[1.02]"
                      style={{
                        background: 'oklch(0.55 0.25 285)',
                        color: 'oklch(0.985 0.006 90)',
                        boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.25)',
                      }}
                    >
                      <Zap size={12} />
                      {planInfo.plan === 'free' ? 'Upgrade to Plus — $10/mo' : 'Upgrade to Pro — $29/mo'}
                      <ChevronRight size={12} />
                    </a>
                  </div>
                </motion.div>
              )}

              {limitError === 'attendee' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-6 flex items-start gap-4"
                  style={{
                    background: 'oklch(0.80 0.17 75 / 0.09)',
                    border: '1px solid oklch(0.80 0.17 75 / 0.28)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'oklch(0.80 0.17 75 / 0.20)' }}
                  >
                    <Users size={18} style={{ color: 'oklch(0.44 0.14 75)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold mb-1" style={{ color: 'oklch(0.28 0.08 285)' }}>
                      Too many attendee emails
                    </p>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'oklch(0.50 0.06 285)' }}>
                      Free plan allows up to {planInfo.maxAttendeeEmails} attendee emails per meeting.
                      Remove some emails or upgrade to Plus for unlimited attendees.
                    </p>
                    <a
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-150 hover:scale-[1.02]"
                      style={{
                        background: 'oklch(0.55 0.25 285)',
                        color: 'oklch(0.985 0.006 90)',
                        boxShadow: '0 2px 12px oklch(0.55 0.25 285 / 0.25)',
                      }}
                    >
                      <Zap size={12} />
                      Upgrade to Plus — $10/mo
                      <ChevronRight size={12} />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Real errors (network, server, etc.) */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 rounded-xl p-4"
                  style={{
                    background: 'oklch(0.97 0.02 25)',
                    border: '1px solid oklch(0.85 0.08 25)',
                  }}
                >
                  <AlertCircle
                    size={17}
                    style={{ color: 'oklch(0.55 0.20 25)' }}
                    className="mt-0.5 shrink-0"
                  />
                  <p className="text-sm" style={{ color: 'oklch(0.40 0.15 25)' }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26, ease: EASE }}
            >
              {isSubmitting ? (
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: 'oklch(0.55 0.25 285 / 0.06)',
                    border: '1px solid oklch(0.70 0.18 285 / 0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Loader2
                      size={18}
                      className="animate-spin"
                      style={{ color: 'oklch(0.52 0.28 300)' }}
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'oklch(0.22 0.04 285)' }}
                    >
                      ActaFlow is working…
                    </span>
                  </div>
                  <div className="space-y-2">
                    {currentSteps.map((step, i) => {
                      const StepIcon = step.icon;
                      const isDone = i < stepIndex;
                      const isActive = i === stepIndex;

                      return (
                        <div key={step.label} className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: isDone
                                ? 'oklch(0.52 0.28 300)'
                                : isActive
                                ? 'oklch(0.80 0.17 75 / 0.25)'
                                : 'oklch(0.945 0.012 285)',
                            }}
                          >
                            {isDone ? (
                              <CheckCircle2 size={13} color="white" />
                            ) : (
                              <StepIcon
                                size={12}
                                style={{
                                  color: isActive ? 'oklch(0.44 0.14 75)' : 'oklch(0.65 0.06 285)',
                                }}
                              />
                            )}
                          </div>
                          <span
                            className="text-sm"
                            style={{
                              color: isDone
                                ? 'oklch(0.52 0.28 300)'
                                : isActive
                                ? 'oklch(0.22 0.04 285)'
                                : 'oklch(0.65 0.06 285)',
                              fontWeight: isActive ? '600' : '400',
                            }}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Meetings counter (not at limit, not pro) */}
                  {planInfo.plan !== 'pro' && (
                    <p className="text-xs text-center" style={{ color: 'oklch(0.60 0.06 285)' }}>
                      {planInfo.plan === 'free' ? 'Free' : 'Plus'} plan · {planInfo.meetingsThisMonth}/{planInfo.meetingLimit} meetings used this month
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={activeTab === 'upload' ? !uploadFile || !extractedTranscript : !transcript.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.01] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{
                      background: 'oklch(0.52 0.28 300)',
                      color: 'oklch(0.985 0.006 90)',
                      boxShadow: '0 4px 20px oklch(0.55 0.25 285 / 0.28)',
                    }}
                  >
                    {activeTab === 'upload' ? (
                      <>
                        <Upload size={16} />
                        Upload &amp; Analyse
                        <ChevronRight size={16} />
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Analyse Meeting
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </form>
    </div>
  );
}
