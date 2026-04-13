"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Login", href: "/sign-in" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png"
              alt="ActaFlow"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
            <span
              className="text-xl font-extrabold tracking-tight"
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
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                style={{
                  color: "oklch(0.50 0.06 285)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "oklch(0.52 0.28 300)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "oklch(0.50 0.06 285)")
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/sign-up"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
              style={{
                background: "oklch(0.52 0.28 300)",
                color: "oklch(0.985 0.006 90)",
                boxShadow: "0 4px 18px oklch(0.55 0.25 285 / 0.28)",
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 rounded-lg"
                style={{ color: "oklch(0.50 0.18 285)" }}
                aria-label="Open menu"
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72"
              style={{
                background: "oklch(0.985 0.006 90)",
                borderLeft: "1px solid oklch(0.88 0.02 285)",
              }}
            >
              <div className="flex flex-col gap-1 pt-8">
                {/* Mobile Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 mb-6 px-2"
                  onClick={() => setOpen(false)}
                >
                  <Image
                    src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png"
                    alt="ActaFlow"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                  />
                  <span
                    className="text-lg font-extrabold tracking-tight"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.48 0.26 300) 0%, oklch(0.63 0.22 300) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    ActaFlow
                  </span>
                </Link>

                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="px-4 py-3 rounded-xl text-base font-medium transition-colors duration-150"
                    style={{ color: "oklch(0.50 0.18 285)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "oklch(0.945 0.012 285)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="mt-4 px-2">
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center w-full py-3 rounded-full text-sm font-semibold"
                    style={{
                      background: "oklch(0.52 0.28 300)",
                      color: "oklch(0.985 0.006 90)",
                    }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
