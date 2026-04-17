import { PricingTable } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const features = [
  {
    label: "Meetings per month",
    free: "2",
    plus: "20",
    pro: "Unlimited",
  },
  {
    label: "Attendee emails per meeting",
    free: "3",
    plus: "Unlimited",
    pro: "Unlimited",
  },
  {
    label: "Audio upload (max size)",
    free: "100 MB",
    plus: "100 MB",
    pro: "500 MB",
  },
  {
    label: "Transcript paste",
    free: true,
    plus: true,
    pro: true,
  },
  {
    label: "AI re-extraction",
    free: null,
    plus: "3 / mo",
    pro: "Unlimited",
  },
  {
    label: "Action item tracker",
    free: "Basic",
    plus: "Full",
    pro: "Full",
  },
  {
    label: "Overdue reminders",
    free: "1 per month",
    plus: "Daily",
    pro: "Daily + SMS",
  },
  {
    label: "Integrations (Notion, Linear)",
    free: null,
    plus: "2 integrations",
    pro: "All integrations",
  },
  {
    label: "Recall.ai bot auto-join",
    free: null,
    plus: null,
    pro: "Included",
  },
  {
    label: "PDF / Markdown export",
    free: null,
    plus: "PDF",
    pro: "PDF + Markdown",
  },
  {
    label: "Team workspace",
    free: null,
    plus: null,
    pro: "5 seats",
  },
  {
    label: "Data retention",
    free: "30 days",
    plus: "1 year",
    pro: "Unlimited",
  },
];

function CellValue({ value }: { value: string | boolean | null }) {
  if (value === null) {
    return (
      <span style={{ color: "oklch(0.70 0.04 285)" }} className="text-lg font-light">
        —
      </span>
    );
  }
  if (value === true) {
    return (
      <span
        style={{ color: "oklch(0.52 0.28 300)" }}
        className="text-base font-semibold"
      >
        ✓
      </span>
    );
  }
  return (
    <span
      style={{ color: "oklch(0.30 0.06 285)" }}
      className="text-sm font-medium"
    >
      {value}
    </span>
  );
}

export default function PricingPage() {
  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background: "oklch(0.985 0.006 90)" }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] -translate-y-1/4 translate-x-1/4"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.52 0.28 300 / 0.07) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 w-[500px] h-[500px] translate-y-1/4 -translate-x-1/4"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.80 0.17 75 / 0.09) 0%, transparent 70%)",
        }}
      />

      {/* Back to home — top left */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 group"
          style={{
            color: "oklch(0.50 0.18 285)",
            background: "oklch(0.945 0.012 285)",
            border: "1px solid oklch(0.88 0.02 285)",
          }}
          aria-label="Back to home"
        >
          <ArrowLeft
            size={15}
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          Home
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
          style={{
            color: "oklch(0.985 0.006 90)",
            background: "oklch(0.55 0.25 285)",
            border: "1px solid oklch(0.50 0.25 285)",
          }}
          aria-label="Go to dashboard"
        >
          Dashboard
        </Link>
      </div>

      <main className="relative pt-10 pb-24 px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-5"
            style={{
              background: "oklch(0.52 0.28 300 / 0.10)",
              color: "oklch(0.48 0.26 300)",
            }}
          >
            Simple, transparent pricing
          </span>

          <h1
            className="font-bold leading-tight mb-4"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "oklch(0.22 0.04 285)",
            }}
          >
            Choose the plan that fits your team
          </h1>

          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: "oklch(0.50 0.06 285)" }}
          >
            Start free. Upgrade when your team needs more.
          </p>
        </div>

        {/* ── Clerk PricingTable ── */}
        <div className="max-w-5xl mx-auto mb-20">
          <PricingTable />
        </div>

        {/* ── Feature comparison table ── */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2
            className="text-center font-semibold mb-8"
            style={{
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              color: "oklch(0.22 0.04 285)",
            }}
          >
            Full feature comparison
          </h2>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid oklch(0.88 0.02 285)",
              boxShadow: "0 4px 32px oklch(0.55 0.25 285 / 0.07)",
              background: "oklch(1 0.004 90)",
            }}
          >
            {/* Table header */}
            <div
              className="grid grid-cols-4 px-6 py-4"
              style={{ borderBottom: "1px solid oklch(0.88 0.02 285)" }}
            >
              <div className="text-sm font-semibold" style={{ color: "oklch(0.50 0.06 285)" }}>
                Feature
              </div>
              {[
                { label: "Free", color: "oklch(0.50 0.06 285)" },
                { label: "Plus", sub: "$10 / mo", color: "oklch(0.48 0.26 300)" },
                { label: "Pro", sub: "$29 / mo", color: "oklch(0.48 0.26 300)" },
              ].map(({ label, sub, color }) => (
                <div key={label} className="text-center">
                  <div
                    className="text-sm font-bold"
                    style={{ color }}
                  >
                    {label}
                  </div>
                  {sub && (
                    <div className="text-xs mt-0.5" style={{ color: "oklch(0.60 0.08 285)" }}>
                      {sub}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {features.map((row, i) => (
              <div
                key={row.label}
                className="grid grid-cols-4 px-6 py-3.5 items-center transition-colors duration-150"
                style={{
                  borderBottom:
                    i < features.length - 1
                      ? "1px solid oklch(0.93 0.01 285)"
                      : "none",
                  background:
                    i % 2 === 0
                      ? "oklch(1 0.004 90)"
                      : "oklch(0.975 0.006 285 / 0.5)",
                }}
              >
                <div className="text-sm font-medium" style={{ color: "oklch(0.30 0.06 285)" }}>
                  {row.label}
                </div>
                <div className="text-center">
                  <CellValue value={row.free} />
                </div>
                <div className="text-center">
                  <CellValue value={row.plus} />
                </div>
                <div className="text-center">
                  <CellValue value={row.pro} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Monetisation callout ── */}
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-2xl px-6 py-5 flex gap-4 items-start"
            style={{
              background: "oklch(0.80 0.17 75 / 0.12)",
              border: "1px solid oklch(0.80 0.17 75 / 0.30)",
            }}
          >
            <span className="text-xl mt-0.5 shrink-0">💡</span>
            <div>
              <span
                className="text-sm font-bold mr-2"
                style={{ color: "oklch(0.45 0.14 75)" }}
              >
                Monetisation insight:
              </span>
              <span className="text-sm" style={{ color: "oklch(0.35 0.08 75)" }}>
                The free plan is deliberately limited to 5 meetings — enough to prove value,
                not enough to run a team on. The jump to Plus is clear the moment a team has
                more than one weekly standup.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
