import Link from "next/link";
import { product } from "@/config/cloudsun";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal, RevealGroup, RevealItem } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  KeyRound,
  ScrollText,
  FileCheck,
  HandHeart,
  Clock,
  Mic,
  Bot,
  MessageSquare,
  Eye,
  Download,
  Filter,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  CircleDot,
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

type LabelKey =
  | "demo"
  | "auth"
  | "provider"
  | "legal";

const labelStyle: Record<
  LabelKey,
  { text: string; className: string }
> = {
  demo: {
    text: "Demonstration control",
    className:
      "border-[oklch(0.65_0.05_250)]/30 bg-[oklch(0.65_0.05_250)]/10 text-[oklch(0.45_0.05_250)]",
  },
  auth: {
    text: "Requires production authentication",
    className:
      "border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]",
  },
  provider: {
    text: "Requires provider integration",
    className:
      "border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]",
  },
  legal: {
    text: "Requires legal review",
    className:
      "border-[oklch(0.5_0_0)]/20 bg-[oklch(0.5_0_0)]/5 text-muted-foreground",
  },
};

interface Control {
  icon: typeof Lock;
  title: string;
  description: string;
  labels: LabelKey[];
}

const controls: Control[] = [
  {
    icon: KeyRound,
    title: "Role-based access",
    description:
      "Owner, admin, manager, agent, analyst and read-only roles. Permissions gate which conversations, automations and patient records each team member can reach.",
    labels: ["demo", "auth"],
  },
  {
    icon: Clock,
    title: "Session management",
    description:
      "Session timeouts, sign-out across devices and a placeholder for SSO/SAML in organisation plans. Production deployments would need a hardened identity provider.",
    labels: ["demo", "auth"],
  },
  {
    icon: ScrollText,
    title: "Data-retention policy",
    description:
      "Configurable retention windows for call recordings, transcripts and conversation history. Records are surfaced for review and export before any purge.",
    labels: ["demo", "legal"],
  },
  {
    icon: Mic,
    title: "Call-recording consent",
    description:
      "Configurable consent prompts at the start of recorded calls, with per-jurisdiction toggles and a no-record path for callers who decline.",
    labels: ["demo", "legal"],
  },
  {
    icon: Bot,
    title: "AI disclosure",
    description:
      "The agent always discloses it is an AI at the start of voice and chat conversations. Disclosure language is editable per channel and per location.",
    labels: ["demo"],
  },
  {
    icon: MessageSquare,
    title: "Patient communication consent",
    description:
      "Channel-level opt-in for SMS, WhatsApp and email. Patient preferences are respected across every workflow and visible to staff.",
    labels: ["demo", "legal"],
  },
  {
    icon: Eye,
    title: "PII masking",
    description:
      "Sensitive fields (insurance IDs, payment details, clinical notes) are masked in transcripts and shared inbox views. Originals are gated behind permissions.",
    labels: ["demo"],
  },
  {
    icon: FileCheck,
    title: "Audit logs",
    description:
      "Every action by a human or the AI agent is captured in an immutable audit log — exports, deletions, configuration changes, approvals and handoffs.",
    labels: ["demo"],
  },
  {
    icon: Download,
    title: "Export & deletion workflow",
    description:
      "Patients can request a copy of their data or its deletion. Requests route to staff for review with a logged, auditable workflow.",
    labels: ["demo", "legal"],
  },
  {
    icon: HandHeart,
    title: "Human approval",
    description:
      "Actions that bind the practice — bookings requiring approval, deposit charges, treatment-plan acceptance — pause for a human to confirm before they complete.",
    labels: ["demo"],
  },
  {
    icon: Filter,
    title: "Restricted-topic controls",
    description:
      "The agent will not diagnose, prescribe, quote clinical outcomes or discuss other patients. Restricted topics route to clinical staff or emergency services.",
    labels: ["demo"],
  },
  {
    icon: PhoneCall,
    title: "Emergency escalation",
    description:
      "Red-flag language (severe swelling, uncontrolled bleeding, difficulty breathing) triggers an immediate escalation script and notifies the on-call team.",
    labels: ["demo"],
  },
];

function ControlCard({ c }: { c: Control }) {
  const Icon = c.icon;
  return (
    <Card className="group h-full border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-5 font-serif text-lg">{c.title}</div>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {c.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {c.labels.map((l) => (
            <Badge
              key={l}
              variant="outline"
              className={`text-[10px] font-medium ${labelStyle[l].className}`}
            >
              {labelStyle[l].text}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[oklch(0.45_0.08_155)] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.05] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Security &amp; trust</SectionLabel>
              <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] text-balance">
                Honest about where we are —{" "}
                <span className="text-[oklch(0.62_0.16_42)]">and what production takes.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                CloudSun Dental is currently an interactive product prototype. Production healthcare
                deployments would require technical, contractual and legal controls appropriate to
                the customer&apos;s jurisdiction, practice-management systems and regulators.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Prototype statement */}
        <section className="border-t border-border/60 bg-background py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <Card className="border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.04]">
                <CardContent className="flex flex-col items-start gap-5 p-8 lg:flex-row lg:items-center lg:p-10">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[oklch(0.62_0.16_42)]/15 text-[oklch(0.62_0.16_42)]">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]">
                      Read this first
                    </div>
                    <p className="mt-2 font-serif text-2xl leading-snug text-foreground sm:text-3xl text-balance">
                      CloudSun Dental is currently an interactive product prototype. Production
                      healthcare deployments would require technical, contractual and legal controls.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {product.prototypeNotice}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* What we are NOT claiming */}
        <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>What we are not claiming</SectionLabel>
              <SectionHeading>
                No compliance theatre. Only controls that actually exist today.
              </SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                We do not claim HIPAA, SOC 2, ISO 27001, GDPR or any other regulatory certification.
                We have not completed a third-party audit. Treat every connection and conversation
                in this product as a demonstration until you have signed a production agreement.
              </p>
            </Reveal>

            <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.07}>
              {[
                { code: "HIPAA", note: "Not certified. PHI handling requires a BAA and a hardened deployment." },
                { code: "SOC 2", note: "Not audited. Controls here are demonstration controls." },
                { code: "GDPR", note: "No DPO appointed. EU deployments require a separate review." },
                { code: "ISO 27001", note: "Not certified. No ISMS in place." },
              ].map((item) => (
                <RevealItem key={item.code}>
                  <Card className="h-full border-border bg-card">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2">
                        <CircleDot className="h-4 w-4 text-muted-foreground/60" />
                        <div className="font-serif text-lg text-foreground/70 line-through decoration-muted-foreground/40">
                          {item.code}
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        {item.note}
                      </p>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Demonstration controls */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Demonstration controls</SectionLabel>
              <SectionHeading>
                What actually exists today — and what production hardening would still be required.
              </SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                Each control below is labelled honestly. &ldquo;Demonstration control&rdquo; means
                the feature is implemented in this prototype. The other three labels describe what a
                real healthcare deployment would need before it could rely on that feature.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {(Object.keys(labelStyle) as LabelKey[]).map((k) => (
                  <Badge
                    key={k}
                    variant="outline"
                    className={`text-[10px] font-medium ${labelStyle[k].className}`}
                  >
                    {labelStyle[k].text}
                  </Badge>
                ))}
              </div>
            </Reveal>

            <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
              {controls.map((c) => (
                <RevealItem key={c.title}>
                  <ControlCard c={c} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Production roadmap */}
        <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Production path</SectionLabel>
              <SectionHeading>
                What a real dental deployment would require from you and from us.
              </SectionHeading>
            </Reveal>

            <RevealGroup className="mt-10 grid gap-5 md:grid-cols-3" stagger={0.08}>
              {[
                {
                  step: "01",
                  title: "Technical controls",
                  items: [
                    "Hardened identity provider (SSO/SAML, MFA)",
                    "Encrypted data stores and transit (TLS 1.2+)",
                    "Region-pinned infrastructure for PHI",
                    "Backup, disaster recovery and incident response",
                  ],
                },
                {
                  step: "02",
                  title: "Contractual controls",
                  items: [
                    "Business Associate Agreement (BAA) where applicable",
                    "Data Processing Agreement (DPA) for EU/UK",
                    "Sub-processor list and disclosure",
                    "Service-level agreements for support and uptime",
                  ],
                },
                {
                  step: "03",
                  title: "Legal & clinical controls",
                  items: [
                    "Jurisdiction-specific privacy review",
                    "Patient consent language and disclosure review",
                    "Clinical-safety governance for handoff rules",
                    "Retention and breach-notification policy",
                  ],
                },
              ].map((col) => (
                <RevealItem key={col.step}>
                  <Card className="h-full border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-2xl text-[oklch(0.62_0.16_42)]">
                          {col.step}
                        </span>
                        <div className="font-serif text-lg">{col.title}</div>
                      </div>
                      <ul className="mt-5 space-y-3">
                        {col.items.map((it) => (
                          <li key={it} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                            <span className="text-foreground/80">{it}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <Reveal>
              <Card className="border-border bg-card shadow-soft">
                <CardContent className="flex flex-col items-start gap-5 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-serif text-2xl text-foreground">
                        Want a security walkthrough for your practice?
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ll walk through each control, the prototype status, and what your
                        jurisdiction would require before going live.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link href="/contact">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Book a review
                        <ArrowRight className="ml-2 h-4 w-4" />
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
