import Link from "next/link";
import { solutions } from "@/config/cloudsun";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal, RevealGroup, RevealItem } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import {
  UserPlus,
  Moon,
  CalendarX,
  RotateCw,
  ClipboardList,
  Building2,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Phone,
  MessageCircle,
  Mail,
  MessageSquare,
  Workflow,
} from "lucide-react";

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={sectionLabel}>{children}</div>;
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mt-4 font-serif text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Moon,
  CalendarX,
  RotateCw,
  ClipboardList,
  Building2,
};

// ─── Per-solution structured content ──────────────────────────────────────────

interface WorkflowStep {
  step: string;
  title: string;
  body: string;
}

interface RelatedScenario {
  title: string;
  blurb: string;
  channel: "phone" | "whatsapp" | "email" | "webchat";
}

interface SolutionContent {
  tagline: string;
  workflow: WorkflowStep[];
  scenarios: RelatedScenario[];
  metrics: { label: string; value: string; sub: string }[];
  guardrails: string[];
  related: string[]; // slugs
}

const solutionContent: Record<string, SolutionContent> = {
  "new-patient-intake": {
    tagline:
      "Every new-patient enquiry answered inside 30 seconds — across phone, email, WhatsApp and web chat — and routed to a booked appointment.",
    workflow: [
      {
        step: "01",
        title: "Capture",
        body: "Inbound call, email, WhatsApp or web chat hits CloudSun first. The agent greets, discloses it's an AI, and asks one question at a time.",
      },
      {
        step: "02",
        title: "Qualify",
        body: "New vs. existing patient, preferred location, insurance, urgency. Clinical questions and emergencies hand off immediately — the agent never diagnoses.",
      },
      {
        step: "03",
        title: "Book",
        body: "Calendar availability is checked in real time. The agent proposes a slot that matches the right provider, duration and buffer.",
      },
      {
        step: "04",
        title: "Confirm",
        body: "Confirmation goes out on the patient's preferred channel with intake-form links, directions and deposit policy if applicable.",
      },
      {
        step: "05",
        title: "Hand off",
        body: "If anything needs a human — a complex history, a VIP, a clinical question — the conversation routes to the right team member with full context.",
      },
    ],
    scenarios: [
      {
        title: "New patient wants cleaning",
        blurb: "First-time caller on a Saturday morning wants a hygiene visit.",
        channel: "phone",
      },
      {
        title: "Insurance question",
        blurb: "Web chat visitor asks whether their plan is in-network before booking.",
        channel: "webchat",
      },
      {
        title: "Whitening info",
        blurb: "WhatsApp enquiry about whitening pricing and next availability.",
        channel: "whatsapp",
      },
    ],
    metrics: [
      { label: "First-response time", value: "< 30s", sub: "Across all channels" },
      { label: "After-hours capture", value: "100%", sub: "No enquiry goes to voicemail" },
      { label: "Demo booking rate", value: "Illustrative", sub: "Depends on practice mix" },
    ],
    guardrails: [
      "Clinical questions are handed off — the AI never diagnoses",
      "Emergency red flags trigger immediate escalation",
      "Deposit- or approval-required appointments hold for a human",
    ],
    related: ["after-hours", "recall"],
  },
  "after-hours": {
    tagline:
      "Coverage from 6 PM to 8 AM, weekends and holidays — without sending patients to voicemail or paying for an answering service that just takes messages.",
    workflow: [
      {
        step: "01",
        title: "Detect",
        body: "Inbound call, email or chat outside practice hours is picked up by CloudSun within seconds, with the practice's after-hours greeting.",
      },
      {
        step: "02",
        title: "Triage",
        body: "The agent asks whether this is a dental emergency. Severe swelling, uncontrolled bleeding or breathing difficulty triggers an emergency script.",
      },
      {
        step: "03",
        title: "Resolve or schedule",
        body: "Non-emergency enquiries are handled end-to-end: FAQs answered from your knowledge base, appointments booked for the next available slot.",
      },
      {
        step: "04",
        title: "Notify",
        body: "A summary lands in the shared inbox for the morning team. Emergencies page the on-call dentist immediately.",
      },
    ],
    scenarios: [
      {
        title: "Tooth pain at 10 PM",
        blurb: "Existing patient calls with worsening pain after the practice is closed.",
        channel: "phone",
      },
      {
        title: "New-patient enquiry overnight",
        blurb: "Web chat visitor from a different time zone wants to book a first visit.",
        channel: "webchat",
      },
      {
        title: "Insurance question on a Sunday",
        blurb: "Email arrives outside business hours asking about coverage.",
        channel: "email",
      },
    ],
    metrics: [
      { label: "Coverage window", value: "24/7", sub: "With after-hours workflow enabled" },
      { label: "Voicemail rate", value: "0%", sub: "Every enquiry is answered" },
      { label: "Morning queue", value: "Summarised", sub: "Team starts the day with context" },
    ],
    guardrails: [
      "Emergency red flags bypass after-hours routing and page on-call staff",
      "Calls requiring clinical judgement hand off with a callback commitment",
      "After-hours bookings respect provider availability the next business day",
    ],
    related: ["new-patient-intake", "cancellations"],
  },
  cancellations: {
    tagline:
      "Fill cancelled slots automatically — without asking the front desk to work a phone tree at 4:55 PM.",
    workflow: [
      {
        step: "01",
        title: "Detect cancellation",
        body: "A patient cancels by phone, WhatsApp or email. The agent confirms the cancellation per policy and releases the slot.",
      },
      {
        step: "02",
        title: "Search the waitlist",
        body: "CloudSun scans the waitlist for patients who asked for that appointment type, provider, location and time window.",
      },
      {
        step: "03",
        title: "Offer the slot",
        body: "Top candidates are contacted on their preferred channel with a specific, time-bound offer — not a generic blast.",
      },
      {
        step: "04",
        title: "Book and confirm",
        body: "First responder gets the slot. Calendar is updated, confirmation goes out, the original patient's cancellation is logged.",
      },
      {
        step: "05",
        title: "Recovery loop",
        body: "If no one claims the slot within the configured window, the team is notified so they can decide whether to leave it open.",
      },
    ],
    scenarios: [
      {
        title: "Cancel",
        blurb: "Patient cancels tomorrow morning's hygiene visit at 5 PM.",
        channel: "phone",
      },
      {
        title: "Reschedule",
        blurb: "Patient asks to move an appointment — slot freed for the waitlist.",
        channel: "whatsapp",
      },
      {
        title: "Waitlist acceptance",
        blurb: "Waitlisted patient gets a WhatsApp offer for the freed slot.",
        channel: "whatsapp",
      },
    ],
    metrics: [
      { label: "Same-day recovery", value: "Illustrative", sub: "Depends on waitlist depth" },
      { label: "Patient outreach", value: "Targeted", sub: "Top matches only — no blasts" },
      { label: "Slot utilisation", value: "Higher", sub: "Vs. manual call-downs" },
    ],
    guardrails: [
      "Cancellation-policy compliance is enforced before the slot is released",
      "Waitlist offers respect patient contact preferences and quiet hours",
      "Slots requiring a specific provider never get offered to a mismatched patient",
    ],
    related: ["recall", "new-patient-intake"],
  },
  recall: {
    tagline:
      "Bring due and overdue patients back with approved reminder sequences — without pressuring anyone or making the front desk dial for hours.",
    workflow: [
      {
        step: "01",
        title: "Identify due patients",
        body: "CloudSun pulls the recall list — due, overdue, and approaching due — from your PMS or from imported patient data.",
      },
      {
        step: "02",
        title: "Send approved reminders",
        body: "Multi-step reminders go out on each patient's preferred channel, with copy your practice has approved in advance.",
      },
      {
        step: "03",
        title: "Handle replies",
        body: "When patients reply — by phone, WhatsApp, email or chat — the agent answers questions, checks availability and books.",
      },
      {
        step: "04",
        title: "De-escalate opt-outs",
        body: "Patients who ask to delay, defer or opt out are handled gracefully and logged so the team can decide on next steps.",
      },
      {
        step: "05",
        title: "Report",
        body: "Reactivation rate, average days-to-book and opt-out count are surfaced in analytics — no vanity metrics.",
      },
    ],
    scenarios: [
      {
        title: "Recall response",
        blurb: "Patient replies to a recall reminder wanting to book a cleaning.",
        channel: "phone",
      },
      {
        title: "Insurance question",
        blurb: "Patient asks whether their insurance covers the recall visit.",
        channel: "email",
      },
      {
        title: "Reschedule",
        blurb: "Patient who booked a recall visit needs to move it.",
        channel: "whatsapp",
      },
    ],
    metrics: [
      { label: "Reactivation rate", value: "Illustrative", sub: "Estimates 30% conversion" },
      { label: "Reminder channels", value: "4", sub: "Phone, email, WhatsApp, web chat" },
      { label: "Opt-out handling", value: "Logged", sub: "No pressure, full audit trail" },
    ],
    guardrails: [
      "Reminder copy is approved by the practice before anything sends",
      "Patient communication consent and channel preferences are enforced",
      "Clinical questions about due dates route to a human, not the AI",
    ],
    related: ["treatment-follow-up", "cancellations"],
  },
  "treatment-follow-up": {
    tagline:
      "Follow up on unfinished treatment plans without pressuring patients — and route every clinical question to a dentist.",
    workflow: [
      {
        step: "01",
        title: "Identify open plans",
        body: "Treatment plans presented but not accepted, and post-op patients due for review, are surfaced from your PMS or imported records.",
      },
      {
        step: "02",
        title: "Send a low-pressure follow-up",
        body: "CloudSun reaches out with a single, opt-in question: do you have any questions, or would you like to discuss financing?",
      },
      {
        step: "03",
        title: "Answer questions",
        body: "Financing, scheduling and logistics questions are answered by the agent from your knowledge base.",
      },
      {
        step: "04",
        title: "Hand off clinical questions",
        body: "Any question about diagnosis, prognosis or treatment alternatives goes to a dentist — never to the AI.",
      },
      {
        step: "05",
        title: "Book the next step",
        body: "If the patient wants to proceed, the agent books the next appointment — with approval required for treatment appointments.",
      },
    ],
    scenarios: [
      {
        title: "Schedule treatment",
        blurb: "Patient wants to proceed with a previously discussed treatment plan.",
        channel: "phone",
      },
      {
        title: "Insurance question",
        blurb: "Patient asks about coverage for a proposed treatment.",
        channel: "email",
      },
      {
        title: "Wants human",
        blurb: "Patient wants to discuss treatment alternatives with a real person.",
        channel: "whatsapp",
      },
    ],
    metrics: [
      { label: "Follow-up cadence", value: "Configurable", sub: "Per plan, per provider" },
      { label: "Clinical hand-offs", value: "100%", sub: "Never answered by the AI" },
      { label: "Financing uptake", value: "Illustrative", sub: "Depends on plan mix" },
    ],
    guardrails: [
      "The AI never quotes clinical outcomes or treatment alternatives",
      "Treatment appointments require human approval before booking",
      "Financing applications route through your approved provider only",
    ],
    related: ["recall", "new-patient-intake"],
  },
  "multi-location": {
    tagline:
      "Standardize front-desk communication across every location — without forcing each practice to give up its own provider mix, hours or fee schedule.",
    workflow: [
      {
        step: "01",
        title: "One tenant, many locations",
        body: "Each location has its own providers, calendars, hours, fees and recall rules — all under a single CloudSun tenant.",
      },
      {
        step: "02",
        title: "Per-location AI behaviour",
        body: "Greeting, location-specific FAQs, on-call rosters and emergency contacts are configured per location, not per tenant.",
      },
      {
        step: "03",
        title: "Cross-location routing",
        body: "If one location is full and another has capacity, the agent can offer the alternative — with the patient's consent.",
      },
      {
        step: "04",
        title: "Centralized oversight",
        body: "A central operations team sees every conversation across every location, with role-based access by location or group-wide.",
      },
      {
        step: "05",
        title: "Group reporting",
        body: "Group-wide analytics — volume, AI-handled rate, revenue influenced — roll up across locations with per-location drill-down.",
      },
    ],
    scenarios: [
      {
        title: "New patient wants cleaning",
        blurb: "Caller asks which location is closest — Central, North or Riverside.",
        channel: "phone",
      },
      {
        title: "Reschedule",
        blurb: "Patient wants to move their appointment to a different location.",
        channel: "whatsapp",
      },
      {
        title: "Upset about delay",
        blurb: "Patient at one location escalates — group manager gets notified.",
        channel: "phone",
      },
    ],
    metrics: [
      { label: "Locations per tenant", value: "Unlimited", sub: "Group and DSO plans" },
      { label: "Per-location config", value: "Independent", sub: "Hours, fees, providers, rosters" },
      { label: "Group reporting", value: "Rolled up", sub: "With per-location drill-down" },
    ],
    guardrails: [
      "Cross-location routing requires patient consent at the point of offer",
      "Role-based access can be scoped to a single location or group-wide",
      "Per-location data-retention and consent rules are honoured independently",
    ],
    related: ["new-patient-intake", "after-hours"],
  },
};

function channelIcon(channel: RelatedScenario["channel"]) {
  switch (channel) {
    case "phone":
      return Phone;
    case "whatsapp":
      return MessageCircle;
    case "email":
      return Mail;
    case "webchat":
      return MessageSquare;
  }
}

interface SolutionPageProps {
  solution: {
    slug: string;
    title: string;
    description: string;
    icon: string;
  };
}

export function SolutionPage({ solution }: SolutionPageProps) {
  const Icon = iconMap[solution.icon] ?? Sparkles;
  const content = solutionContent[solution.slug] ?? solutionContent["new-patient-intake"];
  const related = solutions.filter((s) => content.related.includes(s.slug));

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-[oklch(0.45_0.08_155)] opacity-[0.05] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/solutions/new-patient-intake" className="hover:text-foreground">
                  Solutions
                </Link>
                <span>/</span>
                <span className="text-foreground">{solution.title}</span>
              </div>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <SectionLabel>Solution</SectionLabel>
                  <h1 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] text-balance">
                    {solution.title}
                  </h1>
                </div>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                {solution.description}
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground/80 text-pretty">
                {content.tagline}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/demo">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Try the dental front desk
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline">
                    Book a dental workflow review
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* How CloudSun handles it */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>How CloudSun Dental handles this workflow</SectionLabel>
              <SectionHeading>
                A clear, editable sequence — not a black box.
              </SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                Every step below runs in demo mode today. Each step is configurable, auditable and
                gated by the guardrails at the bottom of this section.
              </p>
            </Reveal>

            <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {content.workflow.map((w) => (
                <RevealItem key={w.step}>
                  <Card className="group h-full border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
                    <CardContent className="flex h-full flex-col p-6">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-[oklch(0.62_0.16_42)]">
                          {w.step}
                        </span>
                        <div className="font-serif text-lg">{w.title}</div>
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {w.body}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Guardrails */}
            <Reveal className="mt-10">
              <Card className="border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/[0.04]">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldMark />
                    Guardrails that don&apos;t move
                  </div>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {content.guardrails.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                        <span className="text-foreground/80">{g}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* Impact metrics */}
        <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Illustrative impact</SectionLabel>
              <SectionHeading>What this could look like in practice.</SectionHeading>
              <p className="mt-5 text-sm text-muted-foreground">
                Numbers below are illustrative — actual results depend on practice volume, conversion,
                service mix and implementation quality.
              </p>
            </Reveal>

            <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-3" stagger={0.08}>
              {content.metrics.map((m) => (
                <RevealItem key={m.label}>
                  <Card className="h-full border-border bg-card">
                    <CardContent className="p-6">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {m.label}
                      </div>
                      <div className="mt-1 font-serif text-3xl text-foreground">{m.value}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{m.sub}</div>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Related scenarios */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Related scenarios</SectionLabel>
              <SectionHeading>See this workflow on real conversations.</SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                Each scenario below is exercisable in the dental front desk demo. Pick one, choose
                your channel and run the simulation.
              </p>
            </Reveal>

            <RevealGroup className="mt-10 grid gap-5 md:grid-cols-3" stagger={0.07}>
              {content.scenarios.map((s) => {
                const ChannelI = channelIcon(s.channel);
                return (
                  <RevealItem key={s.title}>
                    <Link href="/demo" className="block h-full">
                      <Card className="group h-full border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[oklch(0.62_0.16_42)]/40 hover:shadow-lift">
                        <CardContent className="flex h-full flex-col p-5">
                          <div className="flex items-start justify-between">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]">
                              <ChannelI className="h-4 w-4" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                          </div>
                          <div className="mt-4 font-serif text-base leading-tight">{s.title}</div>
                          <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">
                            {s.blurb}
                          </p>
                          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.16_42)]" />
                            {s.channel}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </RevealItem>
                );
              })}
            </RevealGroup>

            <Reveal className="mt-8">
              <Link href="/demo">
                <Button variant="outline">
                  Try the dental front desk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Related solutions */}
        {related.length > 0 && (
          <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
              <Reveal className="max-w-3xl">
                <SectionLabel>Related solutions</SectionLabel>
                <SectionHeading>Solve the next front-desk problem too.</SectionHeading>
              </Reveal>
              <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2" stagger={0.07}>
                {related.map((s) => {
                  const RelIcon = iconMap[s.icon] ?? Sparkles;
                  return (
                    <RevealItem key={s.slug}>
                      <Link href={`/solutions/${s.slug}`} className="block h-full">
                        <Card className="group h-full border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-[oklch(0.62_0.16_42)]/40 hover:shadow-lift">
                          <CardContent className="flex h-full items-start gap-4 p-5">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                              <RelIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-serif text-lg leading-tight">{s.title}</div>
                              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                {s.description}
                              </p>
                            </div>
                            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
                          </CardContent>
                        </Card>
                      </Link>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <Reveal>
              <Card className="relative overflow-hidden border-border bg-[oklch(0.24_0.012_50)] text-white shadow-lift">
                <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[oklch(0.62_0.16_42)] opacity-20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[oklch(0.45_0.08_155)] opacity-20 blur-3xl" />
                <CardContent className="relative p-10 text-center lg:p-14">
                  <Workflow className="mx-auto h-8 w-8 text-[oklch(0.70_0.12_75)]" />
                  <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-4xl text-balance">
                    See {solution.title.toLowerCase()} in action.
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-base text-white/70 text-pretty">
                    Run a real scenario in the dental front desk demo, or book a workflow review so
                    we can scope this for your practice specifically.
                  </p>
                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link href="/demo">
                      <Button
                        size="lg"
                        className="bg-[oklch(0.62_0.16_42)] text-white hover:bg-[oklch(0.62_0.16_42)]/90"
                      >
                        Try the dental front desk
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                      >
                        Book a dental workflow review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ShieldMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-[oklch(0.45_0.08_155)]"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
