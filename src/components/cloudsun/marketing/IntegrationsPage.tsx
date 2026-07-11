import Link from "next/link";
import {
  integrationCatalog,
  capabilityLabel,
  type CapabilityState,
} from "@/config/cloudsun";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal, RevealGroup, RevealItem } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Calendar,
  Video,
  CreditCard,
  FileText,
  Zap,
  Webhook,
  Code,
  ArrowRight,
  Plug,
  CheckCircle2,
  AlertCircle,
  Lock,
  KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

// Map config icon strings → lucide components
const iconMap: Record<string, LucideIcon> = {
  Database,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  Calendar,
  Video,
  CreditCard,
  FileText,
  Zap,
  Webhook,
  Code,
};

// Honest status display — never show "Connected" for a real provider.
// The catalog uses "planned" and "available". We normalise for display:
//  - "planned"   → Planned
//  - "available" → Demo (the integration can be exercised in demo mode, but
//                  nothing is connected to a real provider account)
function normalizeStatus(s: string): CapabilityState {
  if (s === "planned") return "planned";
  if (s === "available") return "demo";
  return "not_connected";
}

const statusColor: Record<CapabilityState, string> = {
  demo: "oklch(0.70 0.12 75)",
  not_connected: "oklch(0.5 0 0)",
  planned: "oklch(0.65 0.05 250)",
  // (others kept for type completeness — not used on this page)
  connecting: "oklch(0.70 0.12 75)",
  connected: "oklch(0.45 0.08 155)",
  reauthorization_required: "oklch(0.62 0.16 42)",
  sync_delayed: "oklch(0.70 0.12 75)",
  error: "oklch(0.62 0.16 42)",
  disabled: "oklch(0.5 0 0)",
};

interface IntegrationMeta {
  syncs: string[];
  permissions: string[];
}

// Per-integration sync/permission metadata, keyed by name.
const metaByName: Record<string, IntegrationMeta> = {
  Dentrix: {
    syncs: ["Patients", "Appointments", "Continuing care", "Treatment plans"],
    permissions: ["Read patients", "Read/write appointments", "Read treatment plans"],
  },
  "Open Dental": {
    syncs: ["Patients", "Appointments", "Recall", "Procedure codes"],
    permissions: ["Read patients", "Read/write appointments", "Read recall list"],
  },
  Eaglesoft: {
    syncs: ["Patients", "Appointments", "Recall", "Patient notes"],
    permissions: ["Read patients", "Read/write appointments"],
  },
  "Curve Dental": {
    syncs: ["Patients", "Appointments", "Continuing care"],
    permissions: ["Read patients", "Read/write appointments"],
  },
  CareStack: {
    syncs: ["Patients", "Appointments", "Treatment plans", "Patient communications"],
    permissions: ["Read patients", "Read/write appointments", "Read treatment plans"],
  },
  Denticon: {
    syncs: ["Patients", "Appointments", "Multi-location schedule"],
    permissions: ["Read patients", "Read/write appointments", "Read locations"],
  },
  "Twilio telephony": {
    syncs: ["Inbound calls", "Outbound calls", "SMS transcripts"],
    permissions: ["Make and receive calls", "Read call recordings", "Send SMS"],
  },
  Gmail: {
    syncs: ["Inbound patient email", "Outbound replies", "Thread history"],
    permissions: ["Read inbox", "Send email", "Modify labels"],
  },
  "Microsoft Outlook": {
    syncs: ["Inbound patient email", "Outbound replies", "Thread history"],
    permissions: ["Read mail", "Send mail", "Read contacts"],
  },
  "WhatsApp Business": {
    syncs: ["Inbound WhatsApp messages", "Template-approved replies", "Delivery status"],
    permissions: ["Read messages", "Send approved templates", "Read business profile"],
  },
  "Website chat widget": {
    syncs: ["Inbound chats", "Visitor context", "Handoff transcript"],
    permissions: ["Embed widget", "Read visitor messages", "Send messages"],
  },
  "SMS provider": {
    syncs: ["Outbound SMS", "Delivery receipts", "Opt-out list"],
    permissions: ["Send SMS", "Read delivery status", "Manage opt-outs"],
  },
  "Google Calendar": {
    syncs: ["Availability", "Booked appointments", "Reschedule events"],
    permissions: ["Read calendars", "Read/write events"],
  },
  "Microsoft Calendar": {
    syncs: ["Availability", "Booked appointments", "Reschedule events"],
    permissions: ["Read calendars", "Read/write events"],
  },
  "Google Meet": {
    syncs: ["Video consultation links", "Join state"],
    permissions: ["Create meet links", "Read event metadata"],
  },
  Zoom: {
    syncs: ["Video consultation links", "Meeting state"],
    permissions: ["Create meetings", "Read meeting details"],
  },
  "Payment provider": {
    syncs: ["Deposit capture", "Refund status", "Transaction log"],
    permissions: ["Charge cards", "Read transactions", "Refund"],
  },
  "Financing provider": {
    syncs: ["Plan offers", "Application status", "Approval amount"],
    permissions: ["Read plans", "Submit applications"],
  },
  "Patient forms": {
    syncs: ["New-patient intake", "Medical history", "Consent forms"],
    permissions: ["Read forms", "Write form submissions"],
  },
  Zapier: {
    syncs: ["Triggers for new lead", "Triggers for booking", "Action steps"],
    permissions: ["Read triggers", "Execute actions"],
  },
  Webhooks: {
    syncs: ["Outbound event payloads", "Retry queue", "Signed payloads"],
    permissions: ["Register endpoints", "Receive events"],
  },
  "REST API": {
    syncs: ["Conversations", "Contacts", "Appointments", "Audit log"],
    permissions: ["API key (read)", "API key (write)", "Read audit log"],
  },
};

function defaultMeta(name: string): IntegrationMeta {
  return {
    syncs: [`${name} data`],
    permissions: [`Authorise ${name} access`],
  };
}

interface CategoryBlurb {
  label: string;
  description: string;
  accent: "ember" | "forest";
}

const categoryBlurbs: Record<string, CategoryBlurb> = {
  "Practice Management": {
    label: "Practice Management",
    description:
      "Dental PMS systems sync patients, appointments, recall and treatment plans. All PMS integrations are planned — none are connected in this demo.",
    accent: "ember",
  },
  Communication: {
    label: "Communication",
    description:
      "Telephony, email, WhatsApp and chat providers carry the actual conversations. In this demo they run in simulated mode.",
    accent: "ember",
  },
  Calendar: {
    label: "Calendar",
    description: "Availability and booking sync so the AI never promises a slot that isn't real.",
    accent: "forest",
  },
  Meetings: {
    label: "Video consultations",
    description: "Used for remote consultation links when a video visit is appropriate.",
    accent: "forest",
  },
  Payments: {
    label: "Payments & forms",
    description:
      "Deposit capture, financing and patient forms. All payment-related integrations are planned.",
    accent: "ember",
  },
  Automation: {
    label: "Automation & API",
    description: "Push events out, pull data in, and extend CloudSun Dental from your own systems.",
    accent: "forest",
  },
};

function IntegrationCard({
  name,
  icon,
  status,
}: {
  name: string;
  icon: string;
  status: CapabilityState;
}) {
  const Icon = iconMap[icon] ?? Plug;
  const meta = metaByName[name] ?? defaultMeta(name);
  const color = statusColor[status];
  const isPlanned = status === "planned";

  return (
    <Card
      className={`group h-full border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift ${
        isPlanned ? "border-dashed border-border" : "border-border"
      }`}
    >
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}14`, color }}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif text-base leading-tight">{name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">{capabilityLabel[status]}</div>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium"
            style={{
              borderColor: `${color}33`,
              backgroundColor: `${color}12`,
              color,
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {isPlanned ? "Planned" : status === "demo" ? "Demo" : "Not connected"}
          </span>
        </div>

        <div className="mt-5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            What it would sync
          </div>
          <ul className="mt-2 space-y-1.5">
            {meta.syncs.map((s) => (
              <li key={s} className="flex items-start gap-2 text-xs text-foreground/80">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.45_0.08_155)]" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Required permissions
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta.permissions.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] text-foreground/70"
              >
                <KeyRound className="h-3 w-3 text-muted-foreground" />
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex-1" />
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          {isPlanned ? (
            <>
              <AlertCircle className="h-3 w-3" />
              Provider agreement required before any connection
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              Connection requires production credentials
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationsPage() {
  // Group by category preserving catalog order
  const categories = Array.from(
    new Set(integrationCatalog.map((i) => i.category)),
  );

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
              <SectionLabel>Integrations</SectionLabel>
              <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] text-balance">
                Connect the systems your dental practice already runs on.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                CloudSun Dental is built to sit alongside your practice-management system, telephony,
                calendar and payments — never to replace them. Every integration on this page shows
                its honest current status. Nothing is marked connected when it isn&apos;t.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.65_0.05_250)]" />
                  Planned
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" />
                  Demo (simulated)
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.5_0_0)]" />
                  Not connected
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Catalog by category */}
        {categories.map((cat, idx) => {
          const items = integrationCatalog.filter((i) => i.category === cat);
          const blurb = categoryBlurbs[cat] ?? {
            label: cat,
            description: "",
            accent: "ember" as const,
          };
          const accentColor =
            blurb.accent === "forest"
              ? "oklch(0.45 0.08 155)"
              : "oklch(0.62 0.16 42)";
          return (
            <section
              key={cat}
              className={`border-t border-border/60 py-16 lg:py-24 ${
                idx % 2 === 0 ? "bg-background" : "bg-muted/30"
              }`}
            >
              <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal className="max-w-3xl">
                  <SectionLabel>{blurb.label}</SectionLabel>
                  <SectionHeading>{cat}</SectionHeading>
                  {blurb.description && (
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                      {blurb.description}
                    </p>
                  )}
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                    style={{
                      borderColor: `${accentColor}33`,
                      backgroundColor: `${accentColor}12`,
                      color: accentColor,
                    }}
                  >
                    {items.length} {items.length === 1 ? "integration" : "integrations"}
                  </div>
                </Reveal>

                <RevealGroup
                  className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
                  stagger={0.06}
                >
                  {items.map((it) => (
                    <RevealItem key={it.name}>
                      <IntegrationCard
                        name={it.name}
                        icon={it.icon}
                        status={normalizeStatus(it.status)}
                      />
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </section>
          );
        })}

        {/* API & webhooks callout */}
        <section className="border-t border-border/60 bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <Card className="border-border bg-muted/30">
                <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                        <Code className="h-5 w-5" />
                      </div>
                      <div className="font-serif text-2xl">Build on top of CloudSun Dental</div>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      The REST API and webhook layer let your engineering team pipe conversations,
                      contacts and appointments into your data warehouse, billing system or custom
                      workflows. Every event is signed and replayable.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/contact">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Request API access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border/60 bg-muted/30 py-20 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <Reveal>
              <Card className="border-border bg-card shadow-soft">
                <CardContent className="flex flex-col items-start gap-5 p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]">
                      <Plug className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-serif text-2xl text-foreground">
                        Running {`{`}your PMS{`}`}? Tell us which one.
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        We&apos;ll walk through what a real connection to your practice-management
                        system would look like — and what it would take to scope.
                      </p>
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Book an integration review
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
