"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Show, UserButton, useUser, useAuth } from "@clerk/nextjs";
import VideoPlayerModal from "@/components/VideoPlayerModal";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const { user, isSignedIn } = useUser();
  const { has } = useAuth();
  const router = useRouter();
  const displayName = user?.username ?? user?.firstName ?? "there";

  const currentPlan =
    has?.({ plan: "pro" })
      ? { label: "Pro",  bg: "oklch(0.52 0.28 300 / 0.12)", border: "oklch(0.52 0.28 300 / 0.35)", color: "oklch(0.40 0.22 300)" }
      : has?.({ plan: "plus" })
      ? { label: "Plus", bg: "oklch(0.80 0.17 75 / 0.13)",  border: "oklch(0.80 0.17 75 / 0.40)",  color: "oklch(0.42 0.14 75)"  }
      : { label: "Free", bg: "oklch(0.945 0.012 285)",       border: "oklch(0.88 0.02 285)",         color: "oklch(0.50 0.06 285)" };

  function handleNavClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    closeDrawer?: boolean
  ) {
    if (!isSignedIn) {
      e.preventDefault();
      router.push("/sign-in");
      if (closeDrawer) setOpen(false);
    } else {
      if (closeDrawer) setOpen(false);
    }
  }

  function handleHowItWorksClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    closeDrawer?: boolean
  ) {
    e.preventDefault();
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      setShowVideo(true);
    }
    if (closeDrawer) setOpen(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16 md:h-18">

            {/* ActaFlow brand text — left side */}
            <Link href="/" className="flex items-center shrink-0">
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

            {/* Logo — absolute center, click to toggle nav */}
            <button
              onClick={() => setNavVisible((v) => !v)}
              className="absolute left-1/2 -translate-x-1/2 shrink-0 cursor-pointer focus:outline-none"
              aria-label="Toggle navigation"
            >
              <motion.div
                animate={{ scale: navVisible ? 1 : 0.92, rotate: navVisible ? 0 : 15 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Image
                  src="https://res.cloudinary.com/dkqbzwicr/image/upload/q_auto/f_auto/v1776082128/actafloelogo_c0fizx.png"
                  alt="ActaFlow"
                  width={64}
                  height={64}
                  className="w-26 h-26 object-contain"
                  priority
                />
              </motion.div>
            </button>

            {/* Desktop Nav */}
            <AnimatePresence>
              {navVisible && (
                <motion.nav
                  key="desktop-nav"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.28, ease: EASE }}
                  className="hidden md:flex items-center gap-1"
                >
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: i * 0.05, duration: 0.22, ease: "easeOut" }}
                    >
                      <Link
                        href={link.href}
                        onClick={link.href === "#how-it-works" ? handleHowItWorksClick : handleNavClick}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 block"
                        style={{ color: "oklch(0.50 0.06 285)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "oklch(0.52 0.28 300)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "oklch(0.50 0.06 285)")
                        }
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Signed-in: avatar only */}
                  <Show when="signed-in">
                    <motion.div
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ delay: navLinks.length * 0.05, duration: 0.22, ease: "easeOut" }}
                      className="ml-2 flex items-center"
                    >
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: currentPlan.bg,
                          border: `1px solid ${currentPlan.border}`,
                          color: currentPlan.color,
                        }}
                      >
                        {currentPlan.label}
                      </span>
                      <UserButton />
                    </motion.div>
                  </Show>
                </motion.nav>
              )}
            </AnimatePresence>

            {/* Mobile — animated hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: "oklch(0.50 0.18 285)" }}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {open ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </button>

          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12, scaleY: 0.94 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -12, scaleY: 0.94 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              transformOrigin: "top",
              background: "oklch(0.985 0.006 90)",
              boxShadow: "0 12px 40px oklch(0.55 0.25 285 / 0.12)",
              borderBottom: "1px solid oklch(0.88 0.02 285)",
            }}
            className="md:hidden fixed top-16 left-0 right-0 z-40 rounded-b-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 pt-3 flex flex-col gap-1">

              {navLinks.map((link, i) => (
                <motion.div
                  key={link.label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.22, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    onClick={(e) => link.href === "#how-it-works" ? handleHowItWorksClick(e, true) : handleNavClick(e, true)}
                    className="block px-4 py-3 rounded-xl text-base font-medium transition-colors duration-150"
                    style={{ color: "oklch(0.50 0.18 285)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "oklch(0.945 0.012 285)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Mobile signed-in: avatar only */}
              <Show when="signed-in">
                <motion.div
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navLinks.length * 0.06, duration: 0.22, ease: "easeOut" }}
                  className="mt-3 px-2 flex justify-center items-center gap-2"
                >
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: currentPlan.bg,
                      border: `1px solid ${currentPlan.border}`,
                      color: currentPlan.color,
                    }}
                  >
                    {currentPlan.label}
                  </span>
                  <UserButton />
                </motion.div>
              </Show>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VideoPlayerModal open={showVideo} onOpenChange={setShowVideo} />
    </>
  );
}
