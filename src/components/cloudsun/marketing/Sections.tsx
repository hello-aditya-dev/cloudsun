"use client";

import Link from "next/link";
import { channelList, product, pricingTiers, formatPrice } from "@/config/cloudsun";
import { ChannelIcon } from "../shared/Channel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone, Mail, MessageCircle, MessageSquare, CalendarCheck, ShieldCheck,
  Sparkles, Workflow, BarChart3, BookOpen, Users, Check, ArrowRight,
  PhoneIncoming, PhoneOutgoing, Bot, UserCheck, Clock, AlertTriangle,
  Lock, FileCheck, KeyRound, ScrollText, CheckCircle2, Zap,
} from "lucide-react";

const sectionLabel = "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={sectionLabel}>{children}</div>;
}

export function SectionHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`mt-4 font-serif text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] text-balance ${className}`}>
      {children}
    </h2>
  );
}

/* ----------------------------- Channel overview ---------------------------- */
export function ChannelOverview() {
  return (
    <section id="channels" className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>Channels</SectionLabel>
          <SectionHeading>
            One front desk for every channel your clients already use.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Phone, email, WhatsApp and website chat stop being four separate inboxes. CloudSun treats
            every interaction as part of the same customer relationship — so a call on Monday and an
            email on Friday show up in one continuous thread.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {channelList.map((c) => (
            <Card key={c.id} className="group overflow-hidden border-border bg-card transition-all hover:shadow-lift">
              <CardContent className="p-6">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${c.color}14`, color: c.color }}
                >
                  <ChannelIcon id={c.id} className="h-5 w-5" />
                </div>
                <div className="mt-5 font-serif text-xl">{c.label}</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Unified customer timeline --------------------- */
export function UnifiedTimeline() {
  return (
    <section id="product" className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionLabel>Unified customer timeline</SectionLabel>
          <SectionHeading>
            A call becomes a WhatsApp, becomes an email — and your team sees it all.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Meera calls on Tuesday to ask about a slot. On Thursday she confirms on WhatsApp. On
            Friday she emails to reschedule. Most tools treat these as three unrelated tickets.
            CloudSun keeps them as one Meera.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Unified identity across phone, email, WhatsApp and chat",
              "Lifetime conversation history on every contact",
              "AI-generated summaries you can actually trust",
              "Safe identity merge with confirmation dialogs",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <Card className="overflow-hidden border-border bg-card shadow-lift">
            <div className="border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[oklch(0.62_0.16_42)] text-xs font-semibold text-white">
                  MK
                </div>
                <div>
                  <div className="text-sm font-medium">Meera Krishnan</div>
                  <div className="text-[11px] text-muted-foreground">Krishnan Legal · VIP client</div>
                </div>
              </div>
            </div>
            <CardContent className="space-y-4 p-5">
              {[
                { day: "Tue", ch: "phone", title: "Called about a quarterly slot", body: "AI confirmed Jul 15 at 09:30.", time: "11:24 AM", color: "oklch(0.62 0.16 42)" },
                { day: "Thu", ch: "whatsapp", title: "WhatsApp confirmation", body: "“Thanks — see you Tuesday.”", time: "8:02 PM", color: "oklch(0.55 0.14 150)" },
                { day: "Fri", ch: "email", title: "Reschedule request", body: "Could we move to the 22nd instead?", time: "9:15 AM", color: "oklch(0.45 0.08 155)" },
              ].map((e) => (
                <div key={e.day + e.ch} className="flex gap-3">
                  <div className="flex w-10 flex-col items-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold" style={{ backgroundColor: `${e.color}1a`, color: e.color }}>
                      {e.day}
                    </div>
                    <div className="mt-1 w-px flex-1 bg-border" />
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{e.ch}</div>
                      <div className="text-[11px] text-muted-foreground">{e.time}</div>
                    </div>
                    <div className="mt-1 text-sm font-medium text-foreground">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{e.body}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- AI capabilities ------------------------------- */
export function AICapabilities() {
  const caps = [
    { icon: PhoneIncoming, title: "Answers calls", body: "Greets callers in your brand voice, understands intent, never puts someone on hold for six minutes." },
    { icon: Mail, title: "Drafts email", body: "Writes replies in your tone. Flags new leads. Routes the rest to the right human." },
    { icon: MessageCircle, title: "Replies on WhatsApp", body: "Sends template-approved messages, confirms bookings, hands off when unsure." },
    { icon: MessageSquare, title: "Handles website chat", body: "Embedded widget answers from your knowledge base and captures leads overnight." },
    { icon: CalendarCheck, title: "Books appointments", body: "Checks real calendar availability, books, reschedules and cancels — with your rules." },
    { icon: UserCheck, title: "Knows when to ask for help", body: "If confidence drops or a VIP is upset, it brings in a human. Quietly, immediately." },
  ];
  return (
    <section id="ai" className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>AI front desk</SectionLabel>
          <SectionHeading>
            A receptionist that never tires, never misses a lead, and always asks before promising.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            CloudSun&apos;s AI agent — call it Sunny or anything you like — does the repetitive work,
            asks one question at a time, and discloses that it&apos;s an AI. The things that need a
            human still go to a human.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {caps.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="border-border bg-card transition-all hover:shadow-lift">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 font-serif text-lg">{c.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Phone-call experience ------------------------- */
export function PhoneExperience() {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <div className="order-2 lg:order-1">
          <Card className="overflow-hidden border-border bg-card shadow-lift">
            <div className="border-b border-border bg-muted/40 px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.62_0.16_42)]" />
                  <span className="text-sm font-medium">Live call · 3:04</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Recording · consent given</Badge>
              </div>
            </div>
            <CardContent className="space-y-3 p-5">
              {[
                { who: "ai", name: "Sunny", text: "Thank you for calling Atelier North, this is Sunny. How can I help?" },
                { who: "caller", name: "Arjun", text: "Hi, I'd like to set up a portfolio review with Amara." },
                { who: "ai", name: "Sunny", text: "Of course. Amara has Thursday at 11:00 or Friday at 15:00. Which works better?" },
                { who: "caller", name: "Arjun", text: "Thursday 11 works." },
                { who: "ai", name: "Sunny", text: "Booked. I'll send a confirmation to your WhatsApp right away." },
              ].map((m, i) => (
                <div key={i} className={`flex ${m.who === "ai" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.who === "ai" ? "bg-muted text-foreground" : "bg-[oklch(0.62_0.16_42)] text-white"}`}>
                    <div className="mb-0.5 text-[10px] opacity-70">{m.name}</div>
                    {m.text}
                  </div>
                </div>
              ))}
              <div className="flex items-end gap-1 rounded-xl border border-border bg-muted/40 p-3">
                {Array.from({ length: 28 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-[oklch(0.62_0.16_42)]/70"
                    style={{ height: `${10 + Math.abs(Math.sin(i * 0.6)) * 28}px`, animation: `cs-wave 1.1s ease-in-out ${i * 0.05}s infinite` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="order-1 lg:order-2">
          <SectionLabel>Phone experience</SectionLabel>
          <SectionHeading>
            A live-call workspace that feels like a control room, not a phone tree.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Every call is transcribed in real time, summarised when it ends, and routed intelligently.
            You can see intent, sentiment and confidence live — and take over with one click when it
            matters.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Live transcript with intent and sentiment detection",
              "Mute, hold, transfer, take over — all keyboard-friendly",
              "Recording consent state always visible",
              "After-call summary, topics, follow-ups and coaching",
              "Clearly labelled demo mode when telephony isn&apos;t connected",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                <span className="text-foreground/80" dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Appointments --------------------------------- */
export function Appointments() {
  return (
    <section className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionLabel>Appointment scheduling</SectionLabel>
          <SectionHeading>
            Booking that reads the calendar, not the script.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            CloudSun checks real Google or Microsoft Calendar availability before it promises a slot.
            It respects working hours, buffers and blackout dates. Notion shows up as a connected
            view, not a scheduling source — because that&apos;s what it actually is.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Day, week and agenda views",
              "Booking source, channel and assignee on every appointment",
              "Working hours, buffers and blackout dates",
              "Google Meet, Zoom and Teams links attached automatically",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <Card className="overflow-hidden border-border bg-card shadow-lift">
          <div className="border-b border-border bg-muted/40 px-5 py-3 flex items-center justify-between">
            <div className="text-sm font-medium">This week</div>
            <div className="flex gap-1 text-[11px]">
              <span className="rounded-md bg-card px-2 py-1 shadow-soft">Week</span>
              <span className="rounded-md px-2 py-1 text-muted-foreground">Day</span>
              <span className="rounded-md px-2 py-1 text-muted-foreground">Agenda</span>
            </div>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-2 text-center text-[11px] text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[
                { day: "11", items: [{ t: "09:30", c: "oklch(0.62 0.16 42)" }] },
                { day: "12", items: [{ t: "14:00", c: "oklch(0.55 0.14 150)" }] },
                { day: "13", items: [] },
                { day: "14", items: [{ t: "11:00", c: "oklch(0.62 0.16 42)" }, { t: "15:00", c: "oklch(0.45 0.08 155)" }] },
                { day: "15", items: [{ t: "10:30", c: "oklch(0.62 0.16 42)" }] },
              ].map((col) => (
                <div key={col.day} className="min-h-[120px] rounded-lg border border-border bg-muted/30 p-1.5">
                  <div className="mb-1 text-xs font-medium">{col.day}</div>
                  <div className="space-y-1">
                    {col.items.map((it, i) => (
                      <div key={i} className="rounded-md px-1.5 py-1 text-[10px] font-medium text-white" style={{ backgroundColor: it.c }}>
                        {it.t}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* --------------------------- Handoff -------------------------------------- */
export function Handoff() {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>AI and human handoff</SectionLabel>
          <SectionHeading>
            The AI does the repetitive work. A human steps in exactly when it counts.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Set confidence thresholds, sentiment floors and VIP rules. When something matters, the AI
            doesn&apos;t guess — it pauses, surfaces the context, and hands off to the right person
            with a clean summary.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            { icon: Bot, title: "AI handles the routine", body: "Confirmations, FAQs, booking, rescheduling, triage — done in seconds, every time." },
            { icon: AlertTriangle, title: "Flags what it can&apos;t", body: "Low confidence, negative sentiment, VIP clients, restricted topics — paused and passed on." },
            { icon: UserCheck, title: "Human takes over with context", body: "Full transcript, AI summary, suggested next action — no reliving the conversation." },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 font-serif text-lg" dangerouslySetInnerHTML={{ __html: c.title }} />
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground" dangerouslySetInnerHTML={{ __html: c.body }} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Knowledge ------------------------------------ */
export function KnowledgeSection() {
  return (
    <section className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <Card className="overflow-hidden border-border bg-card shadow-lift">
          <div className="border-b border-border bg-muted/40 px-5 py-3 text-sm font-medium">Knowledge sources</div>
          <CardContent className="divide-y divide-border p-0">
            {[
              { name: "Atelier North website", type: "Website", records: 142, status: "Synced" },
              { name: "Services & pricing PDF", type: "PDF", records: 18, status: "Synced" },
              { name: "FAQ — common questions", type: "FAQ", records: 64, status: "Synced" },
              { name: "Notion — internal SOPs", type: "Notion", records: 88, status: "Syncing" },
              { name: "Google Drive — intake forms", type: "Drive", records: 12, status: "Error" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-[11px] text-muted-foreground">{s.type} · {s.records} records</div>
                </div>
                <Badge variant={s.status === "Error" ? "destructive" : s.status === "Syncing" ? "secondary" : "outline"} className="text-[10px]">
                  {s.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div>
          <SectionLabel>Knowledge base</SectionLabel>
          <SectionHeading>
            Give the AI your business, not the internet&apos;s guess.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Connect your website, PDFs, FAQs, Notion and Drive. CloudSun answers from what you
            actually offer — and tells you honestly when there&apos;s a gap.
          </p>
          <ul className="mt-7 space-y-3">
            {[
              "Website, sitemap, URL, PDF, document, text, FAQ, Notion, Drive",
              "Coverage report and conflicting-answer detection",
              "Frequently unanswered questions surface automatically",
              "Citations on every AI answer",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                <span className="text-foreground/80">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Automation ----------------------------------- */
export function AutomationSection() {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>Automations</SectionLabel>
          <SectionHeading>
            Rules that turn “someone should…” into “it&apos;s already done.”
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Build triggers, conditions, AI steps, actions, delays and approvals. No decorative node
            canvas — just a clear, editable flow that actually runs.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[
            "When a new WhatsApp lead arrives, qualify it and notify sales",
            "When a call is missed, send a WhatsApp follow-up",
            "When an appointment is booked, send email and WhatsApp confirmation",
            "When customer sentiment turns negative, assign a manager",
            "When AI confidence is low, require human approval",
            "When no response is received for two days, create a follow-up",
          ].map((rule) => (
            <Card key={rule} className="border-border bg-card">
              <CardContent className="flex items-start gap-3 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]">
                  <Workflow className="h-4 w-4" />
                </div>
                <div className="text-sm leading-relaxed text-foreground/80">{rule}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Analytics ------------------------------------ */
export function AnalyticsSection() {
  return (
    <section className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionLabel>Analytics</SectionLabel>
          <SectionHeading>
            Numbers that explain the front desk — not decorate it.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Conversation volume, first-response time, AI-handled rate, revenue influenced, cost per
            appointment. No misleading chart scales, no vanity metrics.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { label: "AI-handled rate", value: "84%", sub: "↑ 6pts vs last week" },
              { label: "Avg first response", value: "1.4m", sub: "↓ from 2.1m" },
              { label: "Appointments booked", value: "56", sub: "last 14 days" },
              { label: "Missed calls recovered", value: "14", sub: "via WhatsApp" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-border bg-card p-4">
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
                <div className="mt-1 font-serif text-2xl">{k.value}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{k.sub}</div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">Demonstration data — not a real customer outcome.</p>
        </div>

        <Card className="overflow-hidden border-border bg-card p-6 shadow-lift">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Conversations · 14 days</div>
              <div className="font-serif text-2xl">488</div>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="rounded-md bg-[oklch(0.62_0.16_42)]/10 px-2 py-1 text-[oklch(0.62_0.16_42)]">AI 84%</span>
              <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">Human 16%</span>
            </div>
          </div>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {[18, 22, 25, 19, 28, 31, 24, 27, 33, 29, 35, 41, 38, 42].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col gap-0.5">
                <div className="rounded-t bg-[oklch(0.62_0.16_42)]" style={{ height: `${h * 2.4}px` }} />
                <div className="rounded-b bg-muted" style={{ height: `${(42 - h) * 0.6}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>Jun 28</span>
            <span>Jul 11</span>
          </div>
        </Card>
      </div>
    </section>
  );
}

/* --------------------------- Security ------------------------------------- */
export function SecuritySection() {
  return (
    <section id="security" className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>Security and control</SectionLabel>
          <SectionHeading>
            You stay in control. The AI works inside the lines you draw.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Role-based permissions, audit logs for every human and AI action, PII masking, recording
            retention controls, and honest status on every integration. Nothing pretends to be live
            when it isn&apos;t.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Lock, title: "2FA & SSO-ready", body: "Two-factor auth today, SSO placeholder for org plans." },
            { icon: KeyRound, title: "Role-based access", body: "Owner, admin, manager, agent, analyst, read-only." },
            { icon: ScrollText, title: "Full audit log", body: "Every action by humans and AI, retained and exportable." },
            { icon: FileCheck, title: "PII masking & retention", body: "Mask sensitive fields. Set recording retention windows." },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 font-serif text-lg">{c.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Integrations --------------------------------- */
export function IntegrationsSection() {
  const cats = ["Communication", "Calendar", "Meetings", "CRM", "Automation", "Storage"];
  const items = [
    { name: "Gmail", cat: "Communication" },
    { name: "Outlook", cat: "Communication" },
    { name: "WhatsApp Business", cat: "Communication" },
    { name: "Website chat", cat: "Communication" },
    { name: "Twilio", cat: "Communication" },
    { name: "Google Calendar", cat: "Calendar" },
    { name: "Microsoft Calendar", cat: "Calendar" },
    { name: "Notion", cat: "Calendar" },
    { name: "Zoom", cat: "Meetings" },
    { name: "Google Meet", cat: "Meetings" },
    { name: "Teams", cat: "Meetings" },
    { name: "HubSpot", cat: "CRM" },
    { name: "Salesforce", cat: "CRM" },
    { name: "Pipedrive", cat: "CRM" },
    { name: "Webhooks", cat: "Automation" },
    { name: "Zapier", cat: "Automation" },
    { name: "REST API", cat: "Automation" },
    { name: "Google Drive", cat: "Storage" },
  ];
  return (
    <section id="integrations" className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>Integrations</SectionLabel>
          <SectionHeading>
            Connect what you already use. Skip what you don&apos;t.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Every integration shows its real status — connected, reauthorisation required, sync
            delayed, error. CloudSun never fakes a live connection.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cats.map((cat) => (
            <Card key={cat} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{cat}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.filter((i) => i.cat === cat).map((i) => (
                    <span key={i.name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.45_0.08_155)]" />
                      {i.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Pricing -------------------------------------- */
export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/60 bg-muted/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="max-w-3xl">
          <SectionLabel>Pricing</SectionLabel>
          <SectionHeading>
            Plans that scale with your front desk, not your anxiety.
          </SectionHeading>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Demo telephony in every plan. Bring your own numbers when you&apos;re ready. No hidden
            per-message surprises.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative overflow-hidden border bg-card ${
                tier.highlighted ? "border-[oklch(0.62_0.16_42)] shadow-lift" : "border-border"
              }`}
            >
              {tier.highlighted && (
                <div className="bg-[oklch(0.62_0.16_42)] px-5 py-2 text-center text-xs font-medium text-white">
                  Most popular
                </div>
              )}
              <CardContent className="p-6">
                <div className="font-serif text-xl">{tier.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">{tier.summary}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-serif text-4xl">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">{tier.cadence}</span>
                </div>
                <Button
                  className={`mt-6 w-full ${tier.highlighted ? "bg-[oklch(0.62_0.16_42)] text-white hover:bg-[oklch(0.62_0.16_42)]/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
                >
                  {tier.cta}
                </Button>
                <ul className="mt-6 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                      <span className="text-foreground/80">{f}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Final CTA ------------------------------------ */
export function FinalCTA() {
  return (
    <section className="border-t border-border/60 bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-5xl px-5 lg:px-8">
        <Card className="relative overflow-hidden border-border bg-[oklch(0.24_0.012_50)] text-white shadow-lift">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[oklch(0.62_0.16_42)] opacity-20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[oklch(0.45_0.08_155)] opacity-20 blur-3xl" />
          <CardContent className="relative p-10 text-center lg:p-16">
            <Zap className="mx-auto h-8 w-8 text-[oklch(0.70_0.12_75)]" />
            <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-5xl text-balance">
              Put an intelligent front desk in front of every conversation.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-white/70 text-pretty">
              Set up in an afternoon. Demo mode works the moment you sign up. Bring your own
              telephony and calendar when you&apos;re ready.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/app">
                <Button size="lg" className="bg-[oklch(0.62_0.16_42)] text-white hover:bg-[oklch(0.62_0.16_42)]/90">
                  Explore the dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  See how it works
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* --------------------------- Footer --------------------------------------- */
export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="font-serif text-xl">
              Cloud<span className="text-[oklch(0.62_0.16_42)]">Sun</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{product.description}</p>
          </div>
          {[
            { title: "Product", links: ["Overview", "Channels", "AI Front Desk", "Pricing", "Security"] },
            { title: "Channels", links: ["Phone", "Email", "WhatsApp", "Website chat"] },
            { title: "Company", links: ["About", "Careers", "Contact", "Status"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{col.title}</div>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-foreground/70 hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>© {product.currentYear} CloudSun. Demonstration prototype.</div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Demo mode · integrations simulated unless connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
