/**
 * Demo persistence layer.
 *
 * All demo mutations go through this store. The store is backed by localStorage
 * so that demo actions (sent messages, internal notes, assignments, snoozes,
 * contact notes, AI configuration, integration demo status, automation enabled
 * state, onboarding progress) survive a page refresh.
 *
 * In production, these same repository interfaces would be backed by Prisma.
 * The UI consumes the interfaces, not the localStorage adapter directly.
 */

import type {
  Appointment, AuditEntry, Automation, Call, Contact, Conversation,
  Integration, KnowledgeSource, Message, TeamMember,
} from "@/types/domain";
import {
  analytics, appointments, auditLog, automations, calls, contacts,
  conversations, integrations, knowledgeSources, messagesByConversation, team,
  recallCases, waitlistEntries, treatmentFollowUps, openSlots,
  type RecallCase, type WaitlistEntry, type TreatmentFollowUp, type OpenSlot,
} from "@/data/demo";

const STORAGE_KEY = "cloudsun.demo.dental.v3";

export interface DemoState {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  contacts: Contact[];
  calls: Call[];
  appointments: Appointment[];
  knowledgeSources: KnowledgeSource[];
  automations: Automation[];
  integrations: Integration[];
  auditLog: AuditEntry[];
  aiConfig: AIConfigState;
  onboardingStep: number;
  resetAt: string;
  recallCases: RecallCase[];
  waitlist: WaitlistEntry[];
  treatmentFollowUps: TreatmentFollowUp[];
  openSlots: OpenSlot[];
}

export interface AIConfigState {
  agentName: string;
  role: string;
  businessName: string;
  locationId: string;
  greeting: string;
  closing: string;
  tone: string;
  formality: string;
  languages: string[];
  pronunciationDict: { word: string; say: string }[];
  disclosure: string;
  newPatientQuestions: string[];
  existingPatientRules: string[];
  emergencyRules: { rule: string; enabled: boolean }[];
  minConfidence: number;
  sentimentThreshold: number;
  maxFailedAttempts: number;
  toolPermissions: Record<string, "disabled" | "suggest" | "approval" | "execute">;
  handoffRules: { rule: string; destination: string; enabled: boolean }[];
  channelSettings: Record<string, { enabled: boolean; greeting: string; responseLength: string; waitTime: string }>;
  voice: string;
  speakingSpeed: string;
  warmth: number;
  expressiveness: number;
  interruptionSensitivity: number;
  publishedAt: string | null;
  draftVersion: number;
}

const defaultAIConfig: AIConfigState = {
  agentName: "Sunny",
  role: "Dental front desk assistant",
  businessName: "Lumen Dental Care",
  locationId: "loc_main",
  greeting: "Thank you for calling Lumen Dental Care, this is Sunny. How can I help you today?",
  closing: "Thank you for calling Lumen Dental Care. Have a wonderful day.",
  tone: "warm",
  formality: "balanced",
  languages: ["English"],
  pronunciationDict: [
    { word: "Lumen", say: "LOO-men" },
    { word: "Invisalign", say: "in-VIZ-uh-lin" },
    { word: "endodontic", say: "en-doh-DON-tik" },
  ],
  disclosure: "Before we proceed, I want to let you know that I am an AI assistant. If you'd like to speak with a human at any time, just let me know.",
  newPatientQuestions: [
    "What is your full name?",
    "What is your date of birth?",
    "What is your phone number?",
    "What is your email address?",
    "Do you have dental insurance?",
    "What is the reason for your visit?",
    "How did you hear about us?",
  ],
  existingPatientRules: [
    "Verify patient identity with name and date of birth",
    "Confirm the reason for the call",
    "Check upcoming appointments",
    "Ask if they need to reschedule or cancel",
    "Review any outstanding balance",
  ],
  emergencyRules: [
    { rule: "Emergency red-flag detection (chest pain, difficulty breathing, severe bleeding)", enabled: true },
    { rule: "Auto-escalate to on-call dentist", enabled: true },
    { rule: "Clinical question → immediate human handoff", enabled: true },
  ],
  minConfidence: 70,
  sentimentThreshold: 35,
  maxFailedAttempts: 2,
  toolPermissions: {
    read_calendar_availability: "execute",
    book_appointment: "execute",
    reschedule_appointment: "suggest",
    cancel_appointment: "approval",
    create_contact: "execute",
    update_contact: "suggest",
    create_lead: "execute",
    send_email: "approval",
    send_whatsapp: "execute",
    transfer_call: "approval",
    create_task: "execute",
    apply_tags: "execute",
  },
  handoffRules: [
    { rule: "VIP patient detected", destination: "Owner (Dr. Priya)", enabled: true },
    { rule: "Negative sentiment", destination: "Manager on duty", enabled: true },
    { rule: "Urgent keywords", destination: "Manager on duty", enabled: true },
    { rule: "Restricted topic", destination: "Human agent", enabled: true },
    { rule: "After hours", destination: "Voicemail + WhatsApp follow-up", enabled: true },
  ],
  channelSettings: {
    phone: { enabled: true, greeting: "Thank you for calling Lumen Dental Care, this is Sunny.", responseLength: "medium", waitTime: "2s" },
    email: { enabled: true, greeting: "Hi {{name}}, thanks for reaching out to Lumen Dental Care.", responseLength: "medium", waitTime: "2s" },
    whatsapp: { enabled: true, greeting: "Hi! Thanks for messaging Lumen Dental Care. How can I help?", responseLength: "short", waitTime: "0s" },
    webchat: { enabled: true, greeting: "Hi there! I'm Sunny, the Lumen Dental Care assistant.", responseLength: "medium", waitTime: "0s" },
  },
  voice: "aria",
  speakingSpeed: "1",
  warmth: 70,
  expressiveness: 50,
  interruptionSensitivity: 80,
  publishedAt: null,
  draftVersion: 1,
};

function freshState(): DemoState {
  return {
    conversations: structuredClone(conversations),
    messages: structuredClone(messagesByConversation),
    contacts: structuredClone(contacts),
    calls: structuredClone(calls),
    appointments: structuredClone(appointments),
    knowledgeSources: structuredClone(knowledgeSources),
    automations: structuredClone(automations),
    integrations: structuredClone(integrations),
    auditLog: structuredClone(auditLog),
    aiConfig: structuredClone(defaultAIConfig),
    onboardingStep: 0,
    resetAt: new Date().toISOString(),
    recallCases: structuredClone(recallCases),
    waitlist: structuredClone(waitlistEntries),
    treatmentFollowUps: structuredClone(treatmentFollowUps),
    openSlots: structuredClone(openSlots),
  };
}

// In-memory cache so SSR and the first client render agree.
let cache: DemoState | null = null;
let hydrated = false;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadFromStorage(): DemoState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
}

function saveToStorage(state: DemoState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable — degrade gracefully to in-memory
  }
}

export function getDemoState(): DemoState {
  if (!cache) {
    cache = freshState();
  }
  if (!hydrated && isBrowser()) {
    const stored = loadFromStorage();
    if (stored) {
      cache = stored;
    }
    hydrated = true;
  }
  return cache;
}

export function setDemoState(updater: (s: DemoState) => DemoState): DemoState {
  const current = getDemoState();
  const next = updater(structuredClone(current));
  cache = next;
  saveToStorage(next);
  // Notify subscribers (UI components) that state changed.
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("cloudsun:demo-update"));
  }
  return next;
}

export function resetDemoWorkspace(): DemoState {
  const fresh = freshState();
  fresh.resetAt = new Date().toISOString();
  cache = fresh;
  saveToStorage(fresh);
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent("cloudsun:demo-update"));
  }
  return fresh;
}

export function isDemoHydrated(): boolean {
  return hydrated;
}

// Subscribe helper for React components.
export function subscribe(callback: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => callback();
  window.addEventListener("cloudsun:demo-update", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("cloudsun:demo-update", handler);
    window.removeEventListener("storage", handler);
  };
}

// Re-export static team (read-only reference data).
export { team, analytics };
