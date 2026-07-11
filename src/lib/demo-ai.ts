/**
 * CloudSun Dental — Deterministic simulated AI response engine.
 *
 * Handles dental-specific intents including emergency screening,
 * clinical-question handoff, and appointment workflows.
 *
 * IMPORTANT: This system does NOT diagnose conditions. Clinical questions
 * always trigger human handoff. Emergency red flags trigger immediate
 * escalation language.
 */

import type { ChannelId } from "@/config/cloudsun";
import { emergencyRedFlags, emergencyResponse } from "@/config/cloudsun";

export type DentalIntent =
  | "new_patient_booking"
  | "existing_patient_reschedule"
  | "cancellation"
  | "tooth_pain"
  | "emergency_red_flag"
  | "insurance_question"
  | "pricing_question"
  | "whitening"
  | "invisalign"
  | "implant"
  | "recall_response"
  | "treatment_follow_up"
  | "request_human"
  | "angry_patient"
  | "clinical_question"
  | "after_hours"
  | "general";

export interface IntentDetection {
  intent: DentalIntent;
  confidence: number;
  matchedKeywords: string[];
  isEmergency: boolean;
  requiresHandoff: boolean;
}

export interface DentalAIResponse {
  text: string;
  confidence: number;
  intent: DentalIntent;
  citations: string[];
  toolCall?: string;
  approvalRequired: boolean;
  handoff: boolean;
  isEmergency: boolean;
  simulated: true;
  questionsAsked?: string[];
  suggestedAppointmentType?: string;
}

const intentKeywords: Record<DentalIntent, string[]> = {
  new_patient_booking: ["new patient", "first time", "book", "appointment", "schedule", "check-up", "checkup", "cleaning"],
  existing_patient_reschedule: ["reschedule", "move", "change", "different time", "postpone"],
  cancellation: ["cancel", "can't make it", "cannot attend"],
  tooth_pain: ["pain", "hurt", "ache", "sore", "sensitive", "tooth pain", "toothache"],
  emergency_red_flag: emergencyRedFlags,
  insurance_question: ["insurance", "coverage", "covered", "claim", "network", "in-network"],
  pricing_question: ["price", "cost", "how much", "fee", "rate", "charge"],
  whitening: ["whitening", "whiten", "bleach"],
  invisalign: ["invisalign", "orthodontic", "braces", "aligner", "straighten"],
  implant: ["implant", "missing tooth", "tooth replacement"],
  recall_response: ["recall", "reminder", "due for", "hygiene", "cleaning due"],
  treatment_follow_up: ["treatment", "consultation", "estimate", "plan", "quote", "financing"],
  request_human: ["human", "person", "real someone", "manager", "talk to", "speak to someone"],
  angry_patient: ["angry", "frustrated", "terrible", "awful", "worst", "unacceptable", "second time", "never again", "ridiculous"],
  clinical_question: ["diagnos", "what is wrong", "what's wrong", "why does", "is it", "could it be", "do i need", "should i", "infection", "abscess", "cavity", "decay"],
  after_hours: ["after hours", "closed", "weekend", "late", "emergency", "urgent"],
  general: [],
};

export function detectIntent(message: string): IntentDetection {
  const lower = message.toLowerCase();
  const matched: string[] = [];

  // Check emergency red flags FIRST — highest priority
  const emergencyHits = emergencyRedFlags.filter((k) => lower.includes(k));
  if (emergencyHits.length > 0) {
    return {
      intent: "emergency_red_flag",
      confidence: 0.98,
      matchedKeywords: emergencyHits,
      isEmergency: true,
      requiresHandoff: true,
    };
  }

  // Check clinical questions early — must hand off, never diagnose
  const clinicalHits = intentKeywords.clinical_question.filter((k) => lower.includes(k));
  if (clinicalHits.length > 0) {
    return {
      intent: "clinical_question",
      confidence: 0.85,
      matchedKeywords: clinicalHits,
      isEmergency: false,
      requiresHandoff: true,
    };
  }

  // Order matters: more specific intents first
  const orderedIntents: DentalIntent[] = [
    "angry_patient",
    "emergency_red_flag",
    "request_human",
    "cancellation",
    "existing_patient_reschedule",
    "tooth_pain",
    "invisalign",
    "implant",
    "whitening",
    "insurance_question",
    "pricing_question",
    "treatment_follow_up",
    "recall_response",
    "after_hours",
    "new_patient_booking",
    "general",
  ];

  let best: DentalIntent = "general";
  let bestScore = 0;

  for (const intent of orderedIntents) {
    if (intent === "emergency_red_flag" || intent === "clinical_question") continue; // already handled
    const kws = intentKeywords[intent];
    const hits = kws.filter((k) => lower.includes(k));
    if (hits.length > 0 && hits.length > bestScore) {
      best = intent;
      bestScore = hits.length;
      matched.push(...hits);
    }
  }

  const confidence = best === "general" ? 0.62 : Math.min(0.97, 0.7 + bestScore * 0.12);
  return {
    intent: best,
    confidence,
    matchedKeywords: matched,
    isEmergency: false,
    requiresHandoff: best === "angry_patient" || best === "request_human",
  };
}

function pickCitations(intent: DentalIntent): string[] {
  switch (intent) {
    case "pricing_question": return ["Services & fees", "FAQ — common patient questions"];
    case "new_patient_booking": return ["New-patient information", "FAQ — common patient questions"];
    case "insurance_question": return ["Insurance policy", "FAQ — common patient questions"];
    case "whitening": return ["Services & fees"];
    case "invisalign": return ["Services & fees", "Financing information"];
    case "implant": return ["Services & fees", "Financing information"];
    case "cancellation": return ["Cancellation policy"];
    case "after_hours": return ["Opening hours", "Emergency guidance"];
    case "treatment_follow_up": return ["Financing information", "FAQ — common patient questions"];
    default: return ["FAQ — common patient questions"];
  }
}

export function generateDentalAIResponse(
  message: string,
  channel: ChannelId,
  contactName: string,
): DentalAIResponse {
  const { intent, confidence, isEmergency, requiresHandoff } = detectIntent(message);
  const firstName = contactName.split(" ")[0] || "there";
  const citations = pickCitations(intent);

  // EMERGENCY: Stop normal workflow, display escalation
  if (isEmergency) {
    return {
      text: emergencyResponse,
      confidence: 0.98,
      intent: "emergency_red_flag",
      citations: ["Emergency guidance"],
      toolCall: "escalate_emergency",
      approvalRequired: false,
      handoff: true,
      isEmergency: true,
      simulated: true,
    };
  }

  // CLINICAL QUESTION: Hand off, never diagnose
  if (intent === "clinical_question") {
    return {
      text: `That's a clinical question that I'm not able to answer — it needs to be assessed by one of our dentists. I'm going to bring in a team member who can help. One moment, ${firstName}.`,
      confidence: 0.85,
      intent: "clinical_question",
      citations: [],
      toolCall: "transfer_to_human",
      approvalRequired: false,
      handoff: true,
      isEmergency: false,
      simulated: true,
    };
  }

  const responses: Record<DentalIntent, { text: string; toolCall?: string; approvalRequired: boolean; handoff: boolean; suggestedAppt?: string; questions?: string[] }> = {
    new_patient_booking: {
      text: `Welcome to Lumen Dental Care, ${firstName}! I'd be happy to help you book. Are you a new or existing patient? And which location works best — Central, North, or Riverside?`,
      toolCall: "create_new_patient_lead",
      approvalRequired: false,
      handoff: false,
      suggestedAppt: "New-patient examination",
      questions: ["New or existing patient?", "Preferred location?", "Preferred day/time?"],
    },
    existing_patient_reschedule: {
      text: `No problem, ${firstName}. I can help you reschedule. What day and time works better for you?`,
      toolCall: "reschedule_appointment",
      approvalRequired: true,
      handoff: false,
      suggestedAppt: "Existing-patient examination",
    },
    cancellation: {
      text: `I understand, ${firstName}. Per our cancellation policy, I can process this for you. Let me bring in a team member to finalise. One moment.`,
      toolCall: "cancel_appointment",
      approvalRequired: true,
      handoff: true,
    },
    tooth_pain: {
      text: `I'm sorry to hear about the pain, ${firstName}. Before we book, I need to check: are you experiencing any severe facial swelling, difficulty breathing, or uncontrolled bleeding?`,
      toolCall: "emergency_screening",
      approvalRequired: false,
      handoff: false,
      questions: ["Any severe swelling?", "Difficulty breathing?", "Uncontrolled bleeding?"],
    },
    emergency_red_flag: {
      text: emergencyResponse,
      toolCall: "escalate_emergency",
      approvalRequired: false,
      handoff: true,
    },
    insurance_question: {
      text: `We accept most major insurance plans, ${firstName}. Could you tell me your insurance provider so I can check coverage? I can also connect you with our front desk for specific coverage questions.`,
      toolCall: "request_insurance_info",
      approvalRequired: false,
      handoff: false,
    },
    pricing_question: {
      text: `Our new-patient examination is $120, hygiene cleaning is $95, and whitening is $350 for a single session. Would you like me to book an appointment? I can also send a full fee schedule to your email.`,
      toolCall: "read_pricing",
      approvalRequired: false,
      handoff: false,
    },
    whitening: {
      text: `We offer professional whitening at $350 for a single session or $600 for a full package, ${firstName}. Would you like to book a whitening appointment?`,
      toolCall: "offer_appointment",
      approvalRequired: false,
      handoff: false,
      suggestedAppt: "Whitening",
    },
    invisalign: {
      text: `We offer Invisalign consultations, ${firstName}. The consultation is $150 and includes a full assessment. Would you like to book? Do you have dental insurance?`,
      toolCall: "offer_consultation",
      approvalRequired: true,
      handoff: false,
      suggestedAppt: "Invisalign consultation",
    },
    implant: {
      text: `Implant consultations are available, ${firstName}. The consultation is $200 and includes a treatment estimate. Would you like to schedule one?`,
      toolCall: "offer_consultation",
      approvalRequired: true,
      handoff: false,
      suggestedAppt: "Implant consultation",
    },
    recall_response: {
      text: `Great to hear from you, ${firstName}! You're due for your hygiene cleaning. I have these slots available — would any of these work?`,
      toolCall: "offer_recall_appointment",
      approvalRequired: false,
      handoff: false,
      suggestedAppt: "Hygiene cleaning",
    },
    treatment_follow_up: {
      text: `Hi ${firstName}, following up on your recent consultation. Do you have any questions about the treatment estimate, or would you like to discuss financing options? I can also arrange a call with our treatment coordinator.`,
      toolCall: "send_follow_up",
      approvalRequired: false,
      handoff: false,
    },
    request_human: {
      text: `Of course, ${firstName}. I'll bring in a team member now. One moment while I transfer you.`,
      toolCall: "transfer_to_human",
      approvalRequired: false,
      handoff: true,
    },
    angry_patient: {
      text: `I'm really sorry for the trouble, ${firstName}. That shouldn't have happened. I'm bringing in a team member personally to make this right — one moment.`,
      toolCall: "escalate_to_manager",
      approvalRequired: false,
      handoff: true,
    },
    clinical_question: {
      text: `That's a clinical question that I'm not able to answer — it needs to be assessed by one of our dentists. I'm going to bring in a team member who can help.`,
      toolCall: "transfer_to_human",
      approvalRequired: false,
      handoff: true,
    },
    after_hours: {
      text: `Thanks for reaching out, ${firstName}. We're currently closed — our hours are 9 AM to 6 PM, Monday to Saturday. If this is a dental emergency with severe swelling, bleeding, or breathing difficulty, please contact emergency services. Otherwise, I can book you for tomorrow or send a follow-up first thing in the morning.`,
      toolCall: "schedule_follow_up",
      approvalRequired: false,
      handoff: false,
    },
    general: {
      text: `Thanks for your message, ${firstName}. Let me help with that. Could you tell me a bit more about what you need?`,
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
    handoff: r.handoff || requiresHandoff,
    isEmergency: false,
    simulated: true,
    questionsAsked: r.questions,
    suggestedAppointmentType: r.suggestedAppt,
  };
}

// ─── Text transforms (kept from original) ─────────────────────────────────────

export function rewriteText(text: string): string {
  return text.replace(/\bHi\b/g, "Hello").replace(/\bthx\b/gi, "thank you").replace(/!+/g, ".");
}

export function shortenText(text: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 2).join(" ");
}

export function makeFriendlier(text: string): string {
  return text.replace(/\bHello\b/g, "Hi there").replace(/\bRegards\b/gi, "Warm regards").replace(/\.$/g, "!");
}

export function makeMoreFormal(text: string): string {
  return text.replace(/\bHi\b/g, "Dear").replace(/\bthx\b/gi, "thank you").replace(/!+/g, ".");
}

export function makeReassuring(text: string): string {
  return `${text} You're in good hands — our team will take great care of you.`;
}

export function makeSimpler(text: string): string {
  return text
    .replace(/\butilize\b/gi, "use")
    .replace(/\bcommence\b/gi, "start")
    .replace(/\bsubsequently\b/gi, "then")
    .replace(/\bfacilitate\b/gi, "help");
}

export function translateText(text: string, _target: string): string {
  return `[Simulated translation to ${_target}] ${text}`;
}

// ─── ROI Calculator ────────────────────────────────────────────────────────────

export interface ROIInputs {
  monthlyCalls: number;
  missedCallPct: number;       // 0-100
  qualifiedBookPct: number;    // 0-100
  avgPatientValue: number;     // USD
  monthlyCancellations: number;
  avgApptValue: number;        // USD
  recallDuePerMonth: number;
  frontDeskHours: number;      // hours/month on repetitive communication
}

export interface ROIOutputs {
  newPatientRevenueAtRisk: number;
  cancellationRevenueAtRisk: number;
  recallOpportunity: number;
  adminHoursAddressable: number;
  totalOpportunity: number;
  suggestedPlan: string;
}

export function calculateROI(inputs: ROIInputs): ROIOutputs {
  const missedCalls = inputs.monthlyCalls * (inputs.missedCallPct / 100);
  const newPatientRevenueAtRisk = Math.round(missedCalls * (inputs.qualifiedBookPct / 100) * inputs.avgPatientValue);
  const cancellationRevenueAtRisk = Math.round(inputs.monthlyCancellations * inputs.avgApptValue);
  const recallOpportunity = Math.round(inputs.recallDuePerMonth * inputs.avgApptValue * 0.3); // 30% conversion estimate
  const adminHoursAddressable = Math.round(inputs.frontDeskHours * 0.4); // 40% addressable estimate
  const totalOpportunity = newPatientRevenueAtRisk + cancellationRevenueAtRisk + recallOpportunity;

  let suggestedPlan = "After Hours";
  if (totalOpportunity > 15000) suggestedPlan = "Practice";
  if (totalOpportunity > 50000) suggestedPlan = "Group";

  return {
    newPatientRevenueAtRisk,
    cancellationRevenueAtRisk,
    recallOpportunity,
    adminHoursAddressable,
    totalOpportunity,
    suggestedPlan,
  };
}
