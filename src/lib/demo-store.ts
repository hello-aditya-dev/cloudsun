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
  recallCases, waitlistEntries, treatmentFollowUps,
  type RecallCase, type WaitlistEntry, type TreatmentFollowUp,
} from "@/data/demo";

const STORAGE_KEY = "cloudsun.demo.dental.v2";

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
}

export interface AIConfigState {
  agentName: string;
  role: string;
  businessName: string;
  greeting: string;
  closing: string;
  tone: string;
  formality: string;
  languages: string[];
  pronunciationDict: { word: string; say: string }[];
  minConfidence: number;
  sentimentThreshold: number;
  maxFailedAttempts: number;
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
  minConfidence: 70,
  sentimentThreshold: 35,
  maxFailedAttempts: 2,
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
