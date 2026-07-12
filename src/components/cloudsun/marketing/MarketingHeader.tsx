"use client";

import { useState } from "react";
import Link from "next/link";
import { m, useScroll, useMotionValueEvent, AnimatePresence, useReducedMotion } from "motion/react";
import { marketingNav, product } from "@/config/cloudsun";
import { Wordmark } from "../shared/Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 24);
  });

  return (
    <m.header
      initial={false}
      animate={{
        height: scrolled ? 56 : 64,
        backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
        borderColor: scrolled ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.04)",
        boxShadow: scrolled ? "0 1px 3px rgba(0,0,0,0.04)" : "0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: motionDuration.standard, ease: motionEase.out }}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md"
      style={{ overflow: "hidden" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" onMouseLeave={() => setHovered(null)}>
          {marketingNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onMouseEnter={() => setHovered(n.href)}
            >
              {n.label}
              {hovered === n.href && (
                <m.div
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[oklch(0.62_0.16_42)]"
                  transition={{ duration: motionDuration.standard, ease: motionEase.out }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <m.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link href="/signup">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Start a controlled pilot</Button>
            </Link>
          </m.div>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <m.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: motionDuration.micro }}>
                <X className="h-5 w-5" />
              </m.div>
            ) : (
              <m.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: motionDuration.micro }}>
                <Menu className="h-5 w-5" />
              </m.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <m.div
              className="absolute inset-0 top-full bg-foreground/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionDuration.fast }}
              onClick={() => setOpen(false)}
            />
            <m.div
              className="absolute left-0 right-0 top-full origin-top border-t border-border bg-background md:hidden"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: motionDuration.standard, ease: motionEase.out }}
            >
              <div className="flex flex-col gap-1 px-5 py-3">
                {marketingNav.map((n, i) => (
                  <m.div
                    key={n.href}
                    initial={reduced ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.05, duration: motionDuration.micro }}
                  >
                    <Link
                      href={n.href}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                      onClick={() => setOpen(false)}
                    >
                      {n.label}
                    </Link>
                  </m.div>
                ))}
                <m.div
                  className="mt-2 flex gap-2 px-1"
                  initial={reduced ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: motionDuration.standard }}
                >
                  <Link href="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Sign in</Button></Link>
                  <Link href="/signup" className="flex-1"><Button size="sm" className="w-full bg-primary text-primary-foreground">Start a controlled pilot</Button></Link>
                </m.div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </m.header>
  );
}
