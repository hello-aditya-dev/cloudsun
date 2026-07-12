"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { channels, type ChannelId } from "@/config/cloudsun";
import {
  generateDentalAIResponse,
  detectIntent,
  type DentalAIResponse,
  type IntentDetection,
} from "@/lib/demo-ai";
import {
  demoConversations,
  demoContacts,
  demoAudit,
} from "@/lib/repositories";
import { setDemoState, getDemoState } from "@/lib/demo-store";
import { locations } from "@/data/demo";
import type {
  Contact,
  Conversation,
  Message,
} from "@/types/domain";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal, RevealGroup, RevealItem } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChannelIcon } from "../shared/Channel";
import {
  Sparkles,
  Phone,
  Mail,
  MessageCircle,
  MessageSquare,
  MapPin,
  UserPlus,
  User,
  Play,
  ArrowRight,
  Bot,
  ShieldQuestion,
  CalendarCheck,
  KeyRound,
  HandHeart,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={sectionLabel}>{children}</div>;
}

type ChannelOption = ChannelId;
type LocationOption = "central" | "north" | "riverside";
type PatientOption = "new" | "existing";

interface Scenario {
  id: string;
  title: string;
  blurb: string;
  patientName: string;
  message: string;
  icon: typeof Phone;
  accent: "ember" | "forest" | "amber";
}

const scenarios: Scenario[] = [
  {
    id: "new-cleaning",
    title: "New patient wants cleaning",
    blurb: "First-time caller asking to book a hygiene visit.",
    patientName: "Priya Sharma",
    message:
      "Hi, I'm a new patient and I'd like to book a cleaning. Do you have any openings this week?",
    icon: UserPlus,
    accent: "forest",
  },
  {
    id: "tooth-pain",
    title: "Tooth pain",
    blurb: "Caller reports worsening toothache over the past two days.",
    patientName: "Daniel Osei",
    message:
      "I've had a toothache for the past two days and it's getting worse. Can someone see me today?",
    icon: AlertTriangle,
    accent: "ember",
  },
  {
    id: "reschedule",
    title: "Reschedule",
    blurb: "Existing patient needs to move their appointment.",
    patientName: "Mei Lin",
    message:
      "Hi Mei Lin here. I need to reschedule my appointment next week — something came up at work.",
    icon: CalendarCheck,
    accent: "forest",
  },
  {
    id: "cancel",
    title: "Cancel",
    blurb: "Patient wants to cancel tomorrow's appointment.",
    patientName: "Carlos Rivera",
    message:
      "I'd like to cancel my appointment tomorrow morning. I can't make it.",
    icon: AlertTriangle,
    accent: "ember",
  },
  {
    id: "insurance",
    title: "Insurance question",
    blurb: "Caller asks whether their insurance is accepted.",
    patientName: "Hana Park",
    message:
      "Hi, do you accept Delta Dental insurance? I'd like to confirm before I book.",
    icon: HelpCircle,
    accent: "amber",
  },
  {
    id: "whitening",
    title: "Whitening info",
    blurb: "Existing patient asks about whitening options and pricing.",
    patientName: "Aarav Patel",
    message:
      "Can you tell me about your teeth whitening options and pricing? I'm interested.",
    icon: Sparkles,
    accent: "ember",
  },
  {
    id: "wants-human",
    title: "Wants human",
    blurb: "Caller explicitly asks to speak with a real person.",
    patientName: "Grace Mwangi",
    message: "I'd like to speak to a real person please, not a chatbot.",
    icon: HandHeart,
    accent: "amber",
  },
  {
    id: "upset-delay",
    title: "Upset about delay",
    blurb: "Patient is frustrated after a long wait at their last visit.",
    patientName: "Liam O'Brien",
    message:
      "This is the second time I've been kept waiting 40 minutes. Unacceptable.",
    icon: AlertTriangle,
    accent: "ember",
  },
  {
    id: "recall-response",
    title: "Recall response",
    blurb: "Patient replies to a recall reminder and wants to book.",
    patientName: "Saanvi Patel",
    message:
      "I got a reminder that I'm due for a cleaning. Can I book something for next week?",
    icon: CalendarCheck,
    accent: "forest",
  },
  {
    id: "schedule-treatment",
    title: "Schedule treatment",
    blurb: "Patient wants to proceed with a previously discussed treatment plan.",
    patientName: "Yusuf Khan",
    message:
      "I'd like to go ahead and schedule the treatment plan we discussed last month.",
    icon: ListChecks,
    accent: "amber",
  },
];

// Emergency scenario for red-flag demonstration
const emergencyScenarios: Scenario[] = [
  {
    id: "emergency-swelling",
    title: "Emergency — severe swelling",
    blurb: "Patient reports severe facial swelling after extraction.",
    patientName: "Raj Malhotra",
    message:
      "I had a tooth extracted yesterday and now I have severe facial swelling and difficulty breathing. Please help!",
    icon: AlertTriangle,
    accent: "ember",
  },
  {
    id: "clinical-question",
    title: "Clinical question",
    blurb: "Patient asks whether their symptoms indicate an infection.",
    patientName: "Amara Obi",
    message:
      "Could this be an infection? My gum is swollen and there's a bad taste. Should I be worried about an abscess?",
    icon: HelpCircle,
    accent: "amber",
  },
];

const allScenarios = [...scenarios, ...emergencyScenarios];

const channelOptions: { id: ChannelOption; icon: typeof Phone }[] = [
  { id: "phone", icon: Phone },
  { id: "whatsapp", icon: MessageCircle },
  { id: "email", icon: Mail },
  { id: "webchat", icon: MessageSquare },
];

const locationOptions: { id: LocationOption; label: string }[] = [
  { id: "central", label: "Central" },
  { id: "north", label: "North" },
  { id: "riverside", label: "Riverside" },
];

const patientOptions: { id: PatientOption; label: string; icon: typeof User }[] = [
  { id: "new", label: "New patient", icon: UserPlus },
  { id: "existing", label: "Existing patient", icon: User },
];

/** Map location option to the demo-data location ID. */
function locationIdFor(loc: LocationOption): string {
  const map: Record<LocationOption, string> = {
    central: "loc_central",
    north: "loc_north",
    riverside: "loc_riverside",
  };
  return map[loc];
}

/** Map location option to a human-readable name. */
function locationNameFor(loc: LocationOption): string {
  const found = locations.find((l) => l.id === locationIdFor(loc));
  return found?.name ?? loc;
}

function intentLabel(intent: string): string {
  const map: Record<string, string> = {
    new_patient_booking: "New-patient booking",
    existing_patient_reschedule: "Reschedule request",
    cancellation: "Cancellation",
    tooth_pain: "Tooth pain",
    emergency_red_flag: "Emergency red flag",
    insurance_question: "Insurance question",
    pricing_question: "Pricing question",
    whitening: "Whitening",
    invisalign: "Invisalign",
    implant: "Implant",
    recall_response: "Recall response",
    treatment_follow_up: "Treatment follow-up",
    request_human: "Human request",
    angry_patient: "Upset patient",
    clinical_question: "Clinical question",
    after_hours: "After-hours",
    general: "General enquiry",
  };
  return map[intent] ?? intent;
}

function Pill<T extends string>({
  options,
  value,
  onChange,
  renderIcon,
  getLabel,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  renderIcon?: (v: T) => React.ReactNode;
  getLabel: (v: T) => string;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {active && (
              <m.span
                layoutId={`pill-${options.join("-")}`}
                className="absolute inset-0 rounded-lg bg-[oklch(0.62_0.16_42)]"
                transition={{ duration: motionDuration.fast, ease: motionEase.out }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {renderIcon?.(opt)}
              {getLabel(opt)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 85
      ? "oklch(0.45 0.08 155)"
      : pct >= 70
        ? "oklch(0.62 0.16 42)"
        : "oklch(0.70 0.12 75)";
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <m.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: motionDuration.standard, ease: motionEase.out }}
        />
      </div>
      <span className="font-serif text-sm tabular-nums text-foreground">{pct}%</span>
    </div>
  );
}

function ResultRow({
  icon: Icon,
  label,
  children,
  accent = "muted",
}: {
  icon: typeof Bot;
  label: string;
  children: React.ReactNode;
  accent?: "muted" | "ember" | "forest";
}) {
  const color =
    accent === "ember"
      ? "oklch(0.62 0.16 42)"
      : accent === "forest"
        ? "oklch(0.45 0.08 155)"
        : "oklch(0.5 0 0)";
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}14`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}

// ─── Persistent scenario execution ──────────────────────────────────────────

/**
 * Build a deterministic conversation ID from the scenario + location + channel.
 * Running the same scenario twice produces the same ID, so the conversation
 * is updated rather than duplicated.
 */
function buildConversationId(
  scenarioId: string,
  location: LocationOption,
  channel: ChannelOption,
): string {
  return `demo_dental_${scenarioId}_${location}_${channel}`;
}

/**
 * Build a deterministic contact ID for the fictional demo patient.
 */
function buildContactId(scenarioId: string): string {
  return `demo_contact_${scenarioId}`;
}

/**
 * Derive a colour from the patient name for the avatar.
 * Uses a simple hash → oklch hue rotation.
 */
function avatarColorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = ((hash % 360) + 360) % 360;
  return `oklch(0.60 0.14 ${hue})`;
}

/**
 * Create or update a fictional Contact (patient) in the repository and return its ID.
 */
function ensureDemoContact(
  scenario: Scenario,
  patientType: PatientOption,
  location: LocationOption,
  channel: ChannelOption,
): string {
  const contactId = buildContactId(scenario.id);
  const existing = demoContacts.getById(contactId);

  const locationLabel = locationOptions.find((l) => l.id === location)?.label ?? "Central";
  const initials = scenario.patientName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const contact: Contact = {
    id: contactId,
    name: scenario.patientName,
    company: undefined,
    identities: [
      { channel: "phone", handle: `+1 555-${scenario.id.slice(0, 3)}-0000`, verified: true },
      { channel: "email", handle: `${scenario.patientName.toLowerCase().replace(/[^a-z]/g, "")}@demo.example`, verified: patientType === "existing" },
    ],
    primaryChannel: channel,
    lastInteraction: new Date().toISOString(),
    leadStage: patientType === "new" ? "new" : "customer",
    ownerId: undefined,
    upcomingAppointmentId: undefined,
    sentiment: "neutral",
    tags: ["demo-scenario", scenario.id],
    notes: `Demo patient created by scenario "${scenario.title}".`,
    aiSummary: "",
    consent: { recorded: true, marketing: patientType === "existing" },
    avatarColor: existing?.avatarColor ?? avatarColorFor(scenario.patientName),
    initials,
    // Dental-specific fields
    patientStatus: patientType === "new" ? "new_lead" : "existing_patient",
    preferredName: scenario.patientName.split(" ")[0],
    preferredLocation: locationLabel,
    preferredDentist: "Any dentist",
    lastVisitAt: patientType === "existing" ? new Date(Date.now() - 45 * 86400000).toISOString() : undefined,
    nextAppointmentId: undefined,
    recallDueAt: undefined,
    recallStatus: "not_due",
    waitlistStatus: "not_on_waitlist",
    treatmentFollowUpStatus: "none",
    insuranceProvider: undefined,
    paymentType: "self_pay",
    dateOfBirthMasked: "XX/XX/XXXX",
    isMinor: false,
  };

  if (existing) {
    // Update the existing contact (merge in new fields)
    demoContacts.update(contactId, {
      lastInteraction: contact.lastInteraction,
      leadStage: contact.leadStage,
      primaryChannel: contact.primaryChannel,
      patientStatus: contact.patientStatus,
      preferredLocation: contact.preferredLocation,
      tags: contact.tags,
    });
  } else {
    // Insert by direct state mutation (no "add" method on ContactRepository)
    setDemoState((s) => ({
      ...s,
      contacts: [...s.contacts, contact],
    }));
  }

  return contactId;
}

/**
 * Create or update a Conversation record with a deterministic ID and return the ID.
 */
function ensureDemoConversation(
  conversationId: string,
  contactId: string,
  scenario: Scenario,
  channel: ChannelOption,
  location: LocationOption,
  intentDetection: IntentDetection,
  aiResponse: DentalAIResponse,
): string {
  const existing = demoConversations.getById(conversationId);
  const now = new Date().toISOString();

  const priority: Conversation["priority"] = aiResponse.isEmergency
    ? "urgent"
    : aiResponse.handoff
      ? "high"
      : "normal";

  const status: Conversation["status"] = aiResponse.handoff
    ? aiResponse.isEmergency
      ? "waiting"
      : "needs_approval"
    : "ai_handling";

  const sentiment: Conversation["sentiment"] = aiResponse.isEmergency
    ? "negative"
    : aiResponse.intent === "angry_patient"
      ? "negative"
      : "neutral";

  const tags = [
    "demo-scenario",
    scenario.id,
    intentDetection.intent,
    ...(aiResponse.isEmergency ? ["emergency"] : []),
    ...(aiResponse.handoff ? ["handoff"] : []),
    ...(aiResponse.suggestedAppointmentType ? ["appointment-suggested"] : []),
  ];

  if (existing) {
    // Update existing conversation — keep it fresh but don't duplicate
    demoConversations.update(conversationId, {
      contactName: scenario.patientName,
      channel,
      subject: `${scenario.title} — ${locationOptions.find((l) => l.id === location)?.label ?? "Central"}`,
      preview: scenario.message,
      lastAt: now,
      unread: 1,
      status,
      priority,
      aiHandling: !aiResponse.handoff,
      tags,
      sentiment,
      aiConfidence: aiResponse.confidence,
    });
  } else {
    // Create the conversation via direct state mutation
    const conv: Conversation = {
      id: conversationId,
      contactId,
      contactName: scenario.patientName,
      channel,
      subject: `${scenario.title} — ${locationOptions.find((l) => l.id === location)?.label ?? "Central"}`,
      preview: scenario.message,
      lastAt: now,
      unread: 1,
      status,
      priority,
      assigneeId: aiResponse.handoff ? "u_anita" : undefined,
      aiHandling: !aiResponse.handoff,
      slaMinutes: aiResponse.isEmergency ? 5 : 30,
      slaBreached: false,
      tags,
      hasAppointment: !!aiResponse.suggestedAppointmentType,
      hasLead: true,
      sentiment,
      aiConfidence: aiResponse.confidence,
    };
    setDemoState((s) => ({
      ...s,
      conversations: [conv, ...s.conversations],
    }));
  }

  return conversationId;
}

/**
 * Persist the three messages (patient, AI, system decision) into the conversation.
 * If the conversation already has messages from a prior run, replace them so
 * re-running the same scenario doesn't produce duplicates.
 */
function persistMessages(
  conversationId: string,
  scenario: Scenario,
  channel: ChannelOption,
  intentDetection: IntentDetection,
  aiResponse: DentalAIResponse,
): void {
  const now = new Date();
  const ts = now.toISOString();

  // Clear any existing messages for this conversation (deterministic — re-running replaces)
  setDemoState((s) => ({
    ...s,
    messages: { ...s.messages, [conversationId]: [] },
  }));

  // 1. Patient message
  const patientMsg: Message = {
    id: `msg_patient_${conversationId}`,
    conversationId,
    author: "customer",
    channel,
    authorName: scenario.patientName,
    body: scenario.message,
    createdAt: ts,
    status: "read",
    kind: "message",
  };

  // 2. Simulated AI response
  const aiMsg: Message = {
    id: `msg_ai_${conversationId}`,
    conversationId,
    author: "ai",
    channel,
    authorName: "CloudSun AI (simulated)",
    body: aiResponse.text,
    createdAt: new Date(now.getTime() + 1500).toISOString(),
    aiConfidence: aiResponse.confidence,
    status: "read",
    kind: "message",
  };

  // 3. System decision event
  const decisionBody = JSON.stringify(
    {
      detectedIntent: intentDetection.intent,
      confidence: intentDetection.confidence,
      isEmergency: intentDetection.isEmergency,
      requiresHandoff: intentDetection.requiresHandoff,
      matchedKeywords: intentDetection.matchedKeywords,
      suggestedAppointmentType: aiResponse.suggestedAppointmentType ?? null,
      toolCall: aiResponse.toolCall ?? null,
      approvalRequired: aiResponse.approvalRequired,
      handoffDecision: aiResponse.handoff
        ? aiResponse.isEmergency
          ? "Immediate escalation — on-call team notified"
          : "Transfers to a human team member"
        : "Handled by the AI front desk",
      humanHandoffReason: aiResponse.handoff
        ? aiResponse.isEmergency
          ? "Emergency red flag detected"
          : aiResponse.intent === "clinical_question"
            ? "Clinical question requires dentist assessment"
            : aiResponse.intent === "angry_patient"
              ? "Negative sentiment — manager escalation"
              : "Patient requested human assistance"
        : null,
    },
    null,
    2,
  );

  const decisionMsg: Message = {
    id: `msg_decision_${conversationId}`,
    conversationId,
    author: "system",
    channel,
    authorName: "CloudSun AI Decision Engine",
    body: decisionBody,
    createdAt: new Date(now.getTime() + 2000).toISOString(),
    kind: "event",
  };

  // Append all three messages using the repository
  demoConversations.appendMessage(conversationId, patientMsg);
  demoConversations.appendMessage(conversationId, aiMsg);
  demoConversations.appendMessage(conversationId, decisionMsg);
}

/**
 * Record an audit entry for the scenario execution.
 */
function recordAudit(
  scenario: Scenario,
  conversationId: string,
  channel: ChannelOption,
  location: LocationOption,
  aiResponse: DentalAIResponse,
): void {
  demoAudit.add({
    id: `al_demo_${scenario.id}_${Date.now()}`,
    actor: "CloudSun AI",
    actorType: "ai",
    action: `Demo scenario executed: ${scenario.title}`,
    resource: `Conversation ${conversationId}`,
    at: new Date().toISOString(),
    ip: "demo-page",
    result: "success",
    details: `Channel: ${channel}, Location: ${location}, Intent: ${aiResponse.intent}, Confidence: ${Math.round(aiResponse.confidence * 100)}%, Emergency: ${aiResponse.isEmergency}, Handoff: ${aiResponse.handoff}`,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────

export function DentalDemoPage() {
  const [scenarioId, setScenarioId] = useState<string>(allScenarios[0].id);
  const [channel, setChannel] = useState<ChannelOption>("phone");
  const [location, setLocation] = useState<LocationOption>("central");
  const [patientType, setPatientType] = useState<PatientOption>("new");

  const [result, setResult] = useState<DentalAIResponse | null>(null);
  const [detection, setDetection] = useState<IntentDetection | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const reduced = useReducedMotion();

  const scenario = useMemo(
    () => allScenarios.find((s) => s.id === scenarioId)!,
    [scenarioId],
  );

  /** Execute the scenario: create persisted contact + conversation + messages + audit. */
  const runSimulation = useCallback(() => {
    setRunning(true);
    // Small delay for visual feedback
    setTimeout(() => {
      const det = detectIntent(scenario.message);
      const resp = generateDentalAIResponse(
        scenario.message,
        channel,
        scenario.patientName,
      );

      // 1. Create or update the fictional patient contact
      const contactId = ensureDemoContact(scenario, patientType, location, channel);

      // 2. Build the deterministic conversation ID
      const convId = buildConversationId(scenario.id, location, channel);

      // 3. Create or update the conversation record
      ensureDemoConversation(convId, contactId, scenario, channel, location, det, resp);

      // 4. Persist the patient message, AI response, and system decision event
      persistMessages(convId, scenario, channel, det, resp);

      // 5. Record the audit entry
      recordAudit(scenario, convId, channel, location, resp);

      // 6. Update component state for the inline result display
      setDetection(det);
      setResult(resp);
      setConversationId(convId);
      setRunning(false);
    }, 280);
  }, [scenario, channel, location, patientType]);

  // Reset results when scenario changes
  const handleScenarioChange = (id: string) => {
    setScenarioId(id);
    setResult(null);
    setDetection(null);
    setConversationId(null);
  };

  const locationLabel =
    locationOptions.find((l) => l.id === location)?.label ?? "Central";

  const toolPermission = result?.toolCall
    ? result.approvalRequired
      ? `Holds for human approval before executing ${result.toolCall}`
      : `Permitted to execute ${result.toolCall} within policy`
    : "No tool call required";

  const handoffDecision = result
    ? result.handoff
      ? result.isEmergency
        ? "Immediate escalation — on-call team notified"
        : "Transfers to a human team member"
      : "Handled by the AI front desk"
    : "";

  // Build a short, readable conversation summary
  const summary = result
    ? `${scenario.patientName} contacted Lumen Dental Care — ${locationLabel} via ${channels[channel].label}. ` +
      `Detected intent: ${intentLabel(result.intent)} at ${Math.round(result.confidence * 100)}% confidence. ` +
      (result.handoff
        ? result.isEmergency
          ? "Emergency red flag triggered immediate escalation."
          : "Conversation handed off to a human team member."
        : "AI completed the exchange within policy boundaries.") +
      (result.suggestedAppointmentType
        ? ` Suggested appointment type: ${result.suggestedAppointmentType}.`
        : "") +
      ` All actions simulated. Conversation persisted with ID ${conversationId}.`
    : "";

  // The inbox URL that links directly to the persisted conversation
  const inboxUrl = conversationId ? `/app/inbox/${conversationId}` : "/app/inbox";

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.06] blur-3xl" />
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Interactive demo</SectionLabel>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                See the dental AI
                <br />
                front desk in action
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-foreground/70">
                Pick a scenario, channel, location and patient type, then run the simulation. You&apos;ll
                see what the AI detected, what knowledge it used, what it asked, what it was permitted
                to do, and whether a human needed to step in.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.05] px-3 py-1.5 text-xs text-[oklch(0.62_0.16_42)]">
                <Bot className="h-3.5 w-3.5" />
                Simulated dental front-desk response
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/[0.05] px-3 py-1.5 text-xs text-[oklch(0.45_0.08_155)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Conversations persist to the inbox — click &ldquo;Open in Inbox&rdquo; to view
              </div>
            </Reveal>
          </div>
        </section>

        {/* Scenario picker */}
        <section className="border-t border-border/60 bg-background py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>1 · Pick a scenario</SectionLabel>
              <h2 className="mt-4 font-serif text-2xl leading-tight text-foreground sm:text-3xl">
                Choose the conversation you want to simulate.
              </h2>
            </Reveal>

            <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
              {allScenarios.map((s) => {
                const Icon = s.icon;
                const active = s.id === scenarioId;
                const accentColor =
                  s.accent === "forest"
                    ? "oklch(0.45 0.08 155)"
                    : s.accent === "ember"
                      ? "oklch(0.62 0.16 42)"
                      : "oklch(0.70 0.12 75)";
                return (
                  <RevealItem key={s.id}>
                    <m.button
                      type="button"
                      onClick={() => handleScenarioChange(s.id)}
                      whileHover={reduced ? undefined : { y: -3 }}
                      whileTap={reduced ? undefined : { scale: 0.98 }}
                      transition={{ duration: motionDuration.fast, ease: motionEase.out }}
                      className={`group flex h-full w-full flex-col rounded-xl border bg-card p-5 text-left transition-colors ${
                        active
                          ? "border-[oklch(0.62_0.16_42)] ring-ember"
                          : "border-border hover:border-[oklch(0.62_0.16_42)]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {active && (
                          <CheckCircle2 className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                        )}
                      </div>
                      <div className="mt-4 font-serif text-base leading-tight">{s.title}</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.blurb}</p>
                      <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Patient · {s.patientName}
                      </div>
                    </m.button>
                  </RevealItem>
                );
              })}
            </RevealGroup>
          </div>
        </section>

        {/* Configuration + run */}
        <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              {/* Context controls */}
              <Reveal variant="left">
                <Card className="h-full border-border bg-card">
                  <CardContent className="p-6">
                    <SectionLabel>2 · Set the context</SectionLabel>
                    <h3 className="mt-3 font-serif text-xl text-foreground">
                      Channel, location and patient type.
                    </h3>

                    <div className="mt-6 space-y-5">
                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <ChannelIcon id={channel} className="h-3.5 w-3.5" />
                          Channel
                        </div>
                        <Pill<ChannelOption>
                          options={channelOptions.map((c) => c.id)}
                          value={channel}
                          onChange={setChannel}
                          getLabel={(id) => channels[id].label}
                          renderIcon={(id) => {
                            const opt = channelOptions.find((c) => c.id === id);
                            if (!opt) return null;
                            const I = opt.icon;
                            return <I className="h-3.5 w-3.5" />;
                          }}
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          Location
                        </div>
                        <Pill
                          options={["central", "north", "riverside"] as const}
                          value={location}
                          onChange={setLocation}
                          getLabel={(id) =>
                            locationOptions.find((l) => l.id === id)?.label ?? id
                          }
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          Patient type
                        </div>
                        <Pill
                          options={["new", "existing"] as const}
                          value={patientType}
                          onChange={setPatientType}
                          getLabel={(id) =>
                            patientOptions.find((p) => p.id === id)?.label ?? id
                          }
                          renderIcon={(id) => {
                            const opt = patientOptions.find((p) => p.id === id);
                            if (!opt) return null;
                            const I = opt.icon;
                            return <I className="h-3.5 w-3.5" />;
                          }}
                        />
                      </div>
                    </div>

                    {/* Deterministic ID preview */}
                    <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Conversation ID (deterministic)
                      </div>
                      <code className="mt-1 block text-xs text-foreground/70 break-all">
                        {buildConversationId(scenario.id, location, channel)}
                      </code>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Re-running the same scenario + location + channel updates the same conversation instead of creating a duplicate.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Selected scenario + run */}
              <Reveal variant="scale">
                <Card className="h-full border-border bg-card">
                  <CardContent className="flex h-full flex-col p-6">
                    <SectionLabel>3 · Review &amp; run</SectionLabel>
                    <h3 className="mt-3 font-serif text-xl text-foreground">
                      {scenario.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{scenario.blurb}</p>

                    <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Patient message
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">
                        &ldquo;{scenario.message}&rdquo;
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <ChannelIcon id={channel} className="h-3 w-3" />
                          {channels[channel].label}
                        </span>
                        <span>·</span>
                        <span>{locationLabel}</span>
                        <span>·</span>
                        <span>
                          {patientType === "new" ? "New patient" : "Existing patient"}
                        </span>
                        <span>·</span>
                        <span>{scenario.patientName}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <m.div whileHover={reduced ? undefined : { y: -1 }} whileTap={reduced ? undefined : { scale: 0.98 }}>
                        <Button
                          size="lg"
                          onClick={runSimulation}
                          disabled={running}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {running ? (
                            <>
                              <m.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block"
                              >
                                <Sparkles className="h-4 w-4" />
                              </m.span>
                              Running simulation…
                            </>
                          ) : (
                            <>
                              <Play className="mr-1 h-4 w-4" />
                              Run simulation
                            </>
                          )}
                        </Button>
                      </m.div>
                      <p className="mt-2 text-center text-[11px] text-muted-foreground">
                        Creates a real persisted conversation in the demo inbox
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="border-t border-border/60 bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <AnimatePresence mode="wait">
              {!result ? (
                <m.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionDuration.standard, ease: motionEase.out }}
                >
                  <Card className="border-dashed border-border bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Bot className="h-6 w-6" />
                      </div>
                      <div className="font-serif text-xl text-foreground">
                        Run the simulation to see the AI front desk in action
                      </div>
                      <p className="max-w-md text-sm text-muted-foreground">
                        You&apos;ll see detected intent, confidence, knowledge used, questions asked,
                        suggested appointment, tool permission and handoff decision. The conversation
                        is persisted so you can open it in the practice dashboard.
                      </p>
                    </CardContent>
                  </Card>
                </m.div>
              ) : (
                <m.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: motionDuration.standard, ease: motionEase.out }}
                >
                  <Reveal>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="max-w-2xl">
                        <SectionLabel>Simulation result</SectionLabel>
                        <h2 className="mt-3 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
                          {scenario.title}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {scenario.patientName} · {channels[channel].label} · {locationLabel} ·{" "}
                          {patientType === "new" ? "New patient" : "Existing patient"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="border-[oklch(0.45_0.08_155)]/30 text-[11px] text-[oklch(0.45_0.08_155)]"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Persisted to inbox
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-[oklch(0.62_0.16_42)]/30 text-[11px] text-[oklch(0.62_0.16_42)]"
                        >
                          <Bot className="mr-1 h-3 w-3" />
                          Simulated
                        </Badge>
                      </div>
                    </div>
                  </Reveal>

                  {/* Conversation transcript */}
                  <Reveal className="mt-8">
                    <Card className="overflow-hidden border-border bg-card shadow-lift">
                      <div className="border-b border-border bg-muted/40 px-5 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-xs font-medium text-foreground">Conversation</div>
                            <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{conversationId}</code>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {channels[channel].label} · {locationLabel} · persisted
                          </div>
                        </div>
                      </div>
                      <CardContent className="space-y-4 p-5">
                        {/* Patient message */}
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground/70">
                            {scenario.patientName
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] text-muted-foreground">
                              {scenario.patientName} · patient
                            </div>
                            <div className="mt-1 rounded-xl rounded-tl-sm border border-border bg-muted/30 px-3 py-2 text-sm text-foreground">
                              {scenario.message}
                            </div>
                          </div>
                        </div>

                        {/* AI response */}
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[oklch(0.62_0.16_42)] text-white">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] text-muted-foreground">
                              Sunny · simulated dental front desk
                            </div>
                            <div className="mt-1 rounded-xl rounded-tl-sm border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.04] px-3 py-2 text-sm text-foreground">
                              {result.text}
                            </div>
                            {result.isEmergency && (
                              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/10 px-2 py-0.5 text-[10px] font-medium text-[oklch(0.62_0.16_42)]">
                                <AlertTriangle className="h-3 w-3" />
                                Emergency escalation triggered
                              </div>
                            )}
                          </div>
                        </div>

                        {/* System decision event (compact) */}
                        <div className="flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <ShieldQuestion className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-[11px] text-muted-foreground">
                              CloudSun AI Decision Engine · system event
                            </div>
                            <div className="mt-1 rounded-xl rounded-tl-sm border border-dashed border-border bg-muted/20 px-3 py-2">
                              <div className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
                                <div>
                                  <span className="text-muted-foreground">Intent:</span>{" "}
                                  <span className="text-foreground">{intentLabel(detection?.intent ?? result.intent)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Confidence:</span>{" "}
                                  <span className="text-foreground">{Math.round((detection?.confidence ?? result.confidence) * 100)}%</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Emergency:</span>{" "}
                                  <span className={result.isEmergency ? "text-[oklch(0.62_0.16_42)] font-medium" : "text-foreground"}>
                                    {result.isEmergency ? "Yes — red flag" : "No"}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Handoff:</span>{" "}
                                  <span className={result.handoff ? "text-[oklch(0.62_0.16_42)] font-medium" : "text-foreground"}>
                                    {result.handoff ? "Yes" : "No"}
                                  </span>
                                </div>
                                {result.suggestedAppointmentType && (
                                  <div>
                                    <span className="text-muted-foreground">Appt type:</span>{" "}
                                    <span className="text-foreground">{result.suggestedAppointmentType}</span>
                                  </div>
                                )}
                                {result.toolCall && (
                                  <div>
                                    <span className="text-muted-foreground">Tool:</span>{" "}
                                    <span className="text-foreground">{result.toolCall}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>

                  {/* Detection + decision grid */}
                  <RevealGroup className="mt-8 grid gap-4 md:grid-cols-2" stagger={0.05}>
                    <RevealItem>
                      <ResultRow icon={Sparkles} label="Detected intent" accent="ember">
                        <div className="flex items-center justify-between">
                          <span>{intentLabel(result.intent)}</span>
                          <Badge variant="outline" className="text-[10px]">
                            {detection?.matchedKeywords.length ?? 0} keyword match
                            {detection?.matchedKeywords.length === 1 ? "" : "es"}
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1 text-[11px] text-muted-foreground">Confidence</div>
                          <ConfidenceBar value={result.confidence} />
                        </div>
                      </ResultRow>
                    </RevealItem>

                    <RevealItem>
                      <ResultRow icon={BookOpen} label="Knowledge used" accent="forest">
                        {result.citations.length > 0 ? (
                          <ul className="space-y-1.5">
                            {result.citations.map((c) => (
                              <li key={c} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[oklch(0.45_0.08_155)]" />
                                <span>{c}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No knowledge source consulted — handled from policy.
                          </span>
                        )}
                      </ResultRow>
                    </RevealItem>

                    <RevealItem>
                      <ResultRow icon={HelpCircle} label="Questions asked">
                        {result.questionsAsked && result.questionsAsked.length > 0 ? (
                          <ul className="space-y-1.5">
                            {result.questionsAsked.map((q) => (
                              <li key={q} className="flex items-start gap-2 text-sm">
                                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[oklch(0.62_0.16_42)]" />
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No clarifying questions — proceeded directly.
                          </span>
                        )}
                      </ResultRow>
                    </RevealItem>

                    <RevealItem>
                      <ResultRow icon={CalendarCheck} label="Suggested appointment type" accent="forest">
                        {result.suggestedAppointmentType ? (
                          <span>{result.suggestedAppointmentType}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No appointment type suggested for this intent.
                          </span>
                        )}
                      </ResultRow>
                    </RevealItem>

                    <RevealItem>
                      <ResultRow
                        icon={KeyRound}
                        label="Tool permission decision"
                        accent={result.approvalRequired ? "ember" : "forest"}
                      >
                        <div className="text-sm">{toolPermission}</div>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              result.approvalRequired
                                ? "border-[oklch(0.62_0.16_42)]/30 text-[oklch(0.62_0.16_42)]"
                                : "border-[oklch(0.45_0.08_155)]/30 text-[oklch(0.45_0.08_155)]"
                            }`}
                          >
                            {result.approvalRequired
                              ? "Requires human approval"
                              : "Auto-permitted within policy"}
                          </Badge>
                          {result.toolCall && (
                            <Badge variant="outline" className="text-[10px]">
                              tool: {result.toolCall}
                            </Badge>
                          )}
                        </div>
                      </ResultRow>
                    </RevealItem>

                    <RevealItem>
                      <ResultRow
                        icon={HandHeart}
                        label="Handoff decision"
                        accent={result.handoff ? "ember" : "forest"}
                      >
                        <div className="text-sm">{handoffDecision}</div>
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              result.handoff
                                ? "border-[oklch(0.62_0.16_42)]/30 text-[oklch(0.62_0.16_42)]"
                                : "border-[oklch(0.45_0.08_155)]/30 text-[oklch(0.45_0.08_155)]"
                            }`}
                          >
                            {result.handoff ? "Routed to human" : "Completed by AI"}
                          </Badge>
                        </div>
                      </ResultRow>
                    </RevealItem>
                  </RevealGroup>

                  {/* Conversation summary */}
                  <Reveal className="mt-8">
                    <Card className="border-border bg-muted/30">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <ShieldQuestion className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                          Conversation summary
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-foreground/80">{summary}</p>
                      </CardContent>
                    </Card>
                  </Reveal>

                  {/* CTA — links directly to the persisted conversation in the inbox */}
                  <Reveal className="mt-8">
                    <Card className="border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/[0.04]">
                      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-serif text-lg text-foreground">
                            Open this conversation in the practice dashboard
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            The unified inbox shows the full transcript, AI decisions, and the
                            human handoff — exactly as your team would see it. This conversation
                            is persisted and survives page refresh.
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <code className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {conversationId}
                            </code>
                            <span className="text-[10px] text-muted-foreground">
                              Deterministic — re-running updates the same conversation
                            </span>
                          </div>
                        </div>
                        <Link href={inboxUrl} className="shrink-0">
                          <Button className="bg-[oklch(0.45_0.08_155)] text-white hover:bg-[oklch(0.45_0.08_155)]/90">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in Inbox
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </Reveal>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
