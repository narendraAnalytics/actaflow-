import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ActaFlow — Turn Meetings Into Action",
  description:
    "AI-powered meeting action item extractor. Drop in a recording or transcript — every attendee gets their action items by email in under 2 minutes.",
  icons: {
    icon: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png",
    shortcut: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png",
    apple: "https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <ClerkProvider>{children}</ClerkProvider>
        </body>
    </html>
  );
}
