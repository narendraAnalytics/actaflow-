import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "oklch(0.985 0.006 90)" }}
    >
      {/* Brand */}
      <div className="mb-8 text-center">
        <span
          className="text-2xl font-extrabold tracking-tight"
          style={{
            backgroundImage:
              "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.63 0.22 300) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ActaFlow
        </span>
        <p className="mt-1 text-sm" style={{ color: "oklch(0.50 0.06 285)" }}>
          Sign in to your account
        </p>
      </div>

      <SignIn />
    </div>
  );
}
