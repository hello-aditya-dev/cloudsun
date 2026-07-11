/**
 * Deterministic demo AI response engine.
 *
 * Generates believable, varied AI responses based on conversation intent,
 * channel, contact name and conversation state. No two intents return the
 * same response. Every response is labelled as simulated.
 *
 * In production, this would be replaced by a real AI provider adapter.
 */

import type { ChannelId } from "@/config/cloudsun";

export type DemoIntent =
  | "pricing"
  | "booking"
  | "rescheduling"
  | "cancellation"
  | "project_status"
  | "request_human"
  | "angry_customer"
  | "unsupported"
  | "after_hours"
  | "general";

export interface IntentDetection {
  intent: DemoIntent;
  confidence: number;
  matchedKeywords: string[];
}

export interface AIResponse {
  text: string;
  confidence: number;
  intent: DemoIntent;
  citations: string[];
  toolCall?: string;
  approvalRequired: boolean;
  handoff: boolean;
  simulated: true;
}

const intentKeywords: Record<DemoIntent, string[]> = {
  pricing: ["price", "pricing", "cost", "how much", "rate", "fee", "package", "couples"],
  booking: ["book", "appointment", "schedule", "slot", "available", "consultation"],
  rescheduling: ["reschedule", "move", "change", "different time", "postpone"],
  cancellation: ["cancel", "refund", "money back"],
  project_status: ["status", "update", "where", "progress", "how's it going"],
  request_human: ["human", "agent", "person", "real someone", "manager", "talk to"],
  angry_customer: ["angry", "frustrated", "terrible", "awful", "worst", "unacceptable", "second time", "never"],
  unsupported: ["legal advice", "medical", "diagnos", "lawsuit", "prescri"],
  after_hours: ["after hours", "closed", "weekend", "late", "emergency"],
  general: [],
};

export function detectIntent(message: string): IntentDetection {
  const lower = message.toLowerCase();
  const matched: string[] = [];
  let best: DemoIntent = "general";
  let bestScore = 0;

  // Order matters: more specific intents checked first so they win ties.
  const orderedIntents: DemoIntent[] = [
    "angry_customer",
    "cancellation",
    "rescheduling",
    "request_human",
    "unsupported",
    "after_hours",
    "pricing",
    "project_status",
    "booking",
  ];

  for (const intent of orderedIntents) {
    const kws = intentKeywords[intent];
    const hits = kws.filter((k) => lower.includes(k));
    if (hits.length > 0 && hits.length > bestScore) {
      best = intent;
      bestScore = hits.length;
      matched.push(...hits);
    }
  }

  const confidence = best === "general" ? 0.62 : Math.min(0.97, 0.7 + bestScore * 0.12);
  return { intent: best, confidence, matchedKeywords: matched };
}

const citationPool = [
  "Services & pricing PDF",
  "FAQ — common questions",
  "Atelier North website",
  "Cancellation policy",
  "Notion — internal SOPs",
];

function pickCitations(intent: DemoIntent): string[] {
  switch (intent) {
    case "pricing": return ["Services & pricing PDF", "FAQ — common questions"];
    case "booking": return ["Atelier North website", "FAQ — common questions"];
    case "rescheduling": return ["Cancellation policy", "FAQ — common questions"];
    case "cancellation": return ["Cancellation policy"];
    case "project_status": return ["Notion — internal SOPs"];
    default: return ["FAQ — common questions"];
  }
}

export function generateDemoAIResponse(
  message: string,
  channel: ChannelId,
  contactName: string,
): AIResponse {
  const { intent, confidence, matchedKeywords } = detectIntent(message);
  const firstName = contactName.split(" ")[0] || "there";
  const citations = pickCitations(intent);

  const responses: Record<DemoIntent, { text: string; toolCall?: string; approvalRequired: boolean; handoff: boolean }> = {
    pricing: {
      text: `Hi ${firstName}, our consultation is $45 for 45 minutes, and the couples package is two 60-minute sessions per month at $96. New clients can add a 30-minute trial for $24. Would you like to book?`,
      toolCall: "read_pricing",
      approvalRequired: false,
      handoff: false,
    },
    booking: {
      text: `Of course, ${firstName}. Let me check the calendar. I have Thursday at 11:00 AM or Friday at 3:00 PM available. Which works better for you?`,
      toolCall: "read_calendar_availability",
      approvalRequired: false,
      handoff: false,
    },
    rescheduling: {
      text: `No problem, ${firstName}. I can move that for you. What day and time works better? I'll honour your original booking rate.`,
      toolCall: "reschedule_appointment",
      approvalRequired: true,
      handoff: false,
    },
    cancellation: {
      text: `I'm sorry it didn't work out, ${firstName}. Per our cancellation policy, I can process a refund if you cancel more than 24 hours before your appointment. Let me bring in a team member to finalise this.`,
      toolCall: "cancel_appointment",
      approvalRequired: true,
      handoff: true,
    },
    project_status: {
      text: `Let me pull up your project notes, ${firstName}. Based on the latest SOPs, your consultation is on track for the original timeline. I can send a written summary to your email if that helps.`,
      toolCall: "read_notion_project",
      approvalRequired: false,
      handoff: false,
    },
    request_human: {
      text: `Of course, ${firstName}. I'll bring in a team member now. One moment while I transfer you.`,
      toolCall: "transfer_to_human",
      approvalRequired: false,
      handoff: true,
    },
    angry_customer: {
      text: `I'm really sorry for the trouble, ${firstName}. That shouldn't have happened. I'm going to bring in a team member personally to make this right — one moment.`,
      toolCall: "escalate_to_manager",
      approvalRequired: false,
      handoff: true,
    },
    unsupported: {
      text: `I'm not able to help with that particular question, ${firstName}. I'd recommend speaking with a qualified professional. Is there something else I can help you with today?`,
      approvalRequired: false,
      handoff: false,
    },
    after_hours: {
      text: `Thanks for reaching out, ${firstName}. We're currently closed — our hours are 9 AM to 6 PM, Monday to Friday. I can book you in for tomorrow morning, or send a WhatsApp follow-up first thing.`,
      toolCall: "schedule_followup",
      approvalRequired: false,
      handoff: false,
    },
    general: {
      text: `Thanks for your message, ${firstName}. Let me check that for you. I'll get back to you within the hour with the details.`,
      approvalRequired: false,
      handoff: false,
    },
  };

  const r = responses[intent];
  return {
    text: r.text,
    confidence,
    intent,
    citations,
    toolCall: r.toolCall,
    approvalRequired: r.approvalRequired,
    handoff: r.handoff,
    simulated: true,
  };
}

/**
 * Composer AI helpers — rewrite, shorten, make friendlier, make more formal.
 * Each is a deterministic transform on the input text.
 */
export function rewriteText(text: string): string {
  return text.replace(/\bHi\b/g, "Hello").replace(/\bthx\b/gi, "thank you").replace(/!+/g, ".");
}

export function shortenText(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(" ");
}

export function makeFriendlier(text: string): string {
  return text
    .replace(/\bHello\b/g, "Hi there")
    .replace(/\bRegards\b/gi, "Warm regards")
    .replace(/\.$/g, "!");
}

export function makeMoreFormal(text: string): string {
  return text
    .replace(/\bHi\b/g, "Dear")
    .replace(/\bthx\b/gi, "thank you")
    .replace(/!+/g, ".");
}

export function translateText(text: string, _target: string): string {
  // Demo — prepend a note. A real adapter would call a translation API.
  return `[Simulated translation to ${_target}] ${text}`;
}
