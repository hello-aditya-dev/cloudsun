"use client";

import { useEffect, useState } from "react";
import { product, channels } from "@/config/cloudsun";
import { Wordmark } from "../shared/Logo";
import { ChannelIcon } from "../shared/Channel";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, PhoneIncoming, CalendarCheck, MessageCircle, CheckCircle2, Sparkles } from "lucide-react";

const flow = [
  { kind: "call", title: "Incoming call", body: "Arjun Malhotra — portfolio review", icon: PhoneIncoming },
  { kind: "transcript", title: "Live transcript", body: "“I'd like to set up a review with Amara.”", icon: Sparkles },
  { kind: "calendar", title: "Checking calendar", body: "Thursday 11:00 — available", icon: CalendarCheck },
  { kind: "booked", title: "Appointment created", body: "July 14 · 11:00–11:45 · Amara", icon: CheckCircle2 },
  { kind: "whatsapp", title: "WhatsApp confirmation sent", body: "Delivered to +91 99888 00112", icon: MessageCircle },
  { kind: "inbox", title: "Conversation unified", body: "Appears in shared inbox with full history", icon: CheckCircle2 },
] as const;

export function Hero({ onEnter }: { onEnter: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (flow.length + 1)), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-paper">
      <div className="pointer-events-none absolute inset-0 bg-grid-faint opacity-40" />
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.07] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-[oklch(0.45_0.08_155)] opacity-[0.06] blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.62_0.16_42)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.62_0.16_42)]" />
              </span>
              Omnichannel AI front desk · {product.demoModeLabel}
            </div>

            <h1 className="mt-6 font-serif text-[2.75rem] leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4rem]">
              Every client conversation.
              <br />
              <span className="text-[oklch(0.62_0.16_42)]">One intelligent front desk.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              {product.supporting}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={onEnter} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Explore the dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                <Play className="mr-2 h-4 w-4" />
                See how it works
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {Object.values(channels).map((c) => (
                <div key={c.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChannelIcon id={c.id} className="h-4 w-4" style={{ color: c.color } as React.CSSProperties} />
                  {c.label}
                </div>
              ))}
            </div>
          </div>

          {/* Animated product preview */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <ProductPreview step={step} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductPreview({ step }: { step: number }) {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-[oklch(0.62_0.16_42)]/10 via-transparent to-[oklch(0.45_0.08_155)]/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
        {/* Window chrome */}
        <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <Wordmark className="!text-base" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.62_0.16_42)]/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.45_0.08_155)]/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          </div>
          <div className="text-[11px] font-medium text-muted-foreground">Live · demo</div>
        </div>

        <div className="grid grid-cols-12">
          {/* Mini sidebar */}
          <div className="col-span-3 hidden border-r border-border bg-muted/30 p-3 sm:block">
            <div className="space-y-1">
              {["Overview", "Inbox", "Calls", "Calendar", "AI agent"].map((label, i) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${
                    i === 1 ? "bg-card font-medium text-foreground shadow-soft" : "text-muted-foreground"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Main panel */}
          <div className="col-span-12 p-4 sm:col-span-9 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">AI front desk</div>
                <div className="font-serif text-lg leading-tight">Live activity</div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.62_0.16_42)]" />
                Listening
              </div>
            </div>

            <div className="space-y-2">
              {flow.map((f, i) => {
                const active = i < step;
                const current = i === step - 1 || (step === 0 && i === 0);
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-start gap-3 rounded-xl border p-3 transition-all duration-500 ${
                      active
                        ? "border-border bg-card opacity-100"
                        : current
                          ? "border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.04] opacity-100 ring-ember"
                          : "border-border/50 bg-muted/20 opacity-40"
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        active || current
                          ? "bg-[oklch(0.62_0.16_42)] text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-foreground">{f.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {active ? "done" : current ? "now" : "—"}
                        </div>
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{f.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* waveform */}
            <div className="mt-4 flex items-end gap-1 rounded-xl border border-border bg-card p-3">
              {Array.from({ length: 36 }).map((_, i) => {
                const h = 20 + Math.abs(Math.sin(i * 0.7 + step)) * 60;
                return (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-[oklch(0.62_0.16_42)]/70"
                    style={{ height: `${h}%`, animation: `cs-wave 1.1s ease-in-out ${i * 0.04}s infinite` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
