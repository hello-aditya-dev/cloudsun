"use client";

import { useState } from "react";
import { marketingNav, product } from "@/config/cloudsun";
import { Wordmark } from "../shared/Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function MarketingHeader({ onEnter }: { onEnter: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#top" className="flex items-center">
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {marketingNav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" onClick={onEnter}>
            Sign in
          </Button>
          <Button size="sm" onClick={onEnter} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Start building
          </Button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="flex flex-col gap-1 px-5 py-3">
            {marketingNav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </a>
            ))}
            <div className="mt-2 flex gap-2 px-1">
              <Button variant="outline" size="sm" className="flex-1" onClick={onEnter}>
                Sign in
              </Button>
              <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={onEnter}>
                Start building
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
