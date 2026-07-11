"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wordmark, Logo } from "../shared/Logo";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Phone, Mail, MessageCircle, MessageSquare, Building2, Calendar, Bot, Clock, X, Check } from "lucide-react";

const steps = [
  { id: "business", label: "Business", href: "/onboarding/business" },
  { id: "channels", label: "Channels", href: "/onboarding/channels" },
  { id: "knowledge", label: "Knowledge", href: "/onboarding/knowledge" },
  { id: "agent", label: "AI identity", href: "/onboarding/agent" },
  { id: "availability", label: "Availability", href: "/onboarding/availability" },
  { id: "test", label: "Test", href: "/onboarding/test" },
  { id: "complete", label: "Complete", href: "/onboarding/complete" },
];

export function OnboardingShell({
  currentStep,
  children,
}: {
  currentStep: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card/60 px-5 backdrop-blur">
        <Link href="/"><Wordmark className="!text-base" /></Link>
        <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Exit onboarding">
          <X className="h-4 w-4" />
        </Link>
      </header>

      <div className="border-b border-border bg-card/40 px-5 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {steps.map((s, i) => (
            <Link key={s.id} href={s.href} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${i < currentStep ? "bg-[oklch(0.45_0.08_155)] text-white" : i === currentStep ? "bg-[oklch(0.62_0.16_42)] text-white" : "bg-muted text-muted-foreground"}`}>
                {i < currentStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-xs sm:block ${i === currentStep ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < currentStep ? "bg-[oklch(0.45_0.08_155)]" : "bg-border"}`} />}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-1 items-start justify-center px-5 py-8">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  );
}

export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function StepNav({ nextHref, nextLabel = "Continue", backHref = "/onboarding", isLast = false }: { nextHref: string; nextLabel?: string; backHref?: string; isLast?: boolean }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <Link href={backHref}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
        </Button>
      </Link>
      <Link href={nextHref}>
        <Button size="sm" className="gap-1.5">
          {isLast ? "Enter dashboard" : nextLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
