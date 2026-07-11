import type { ChannelId } from "@/config/cloudsun";

export type ID = string;
export type ISODate = string;

export type Role =
  | "owner"
  | "administrator"
  | "manager"
  | "agent"
  | "analyst"
  | "read_only";

export interface Workspace {
  id: ID;
  name: string;
  plan: "Starter" | "Practice" | "Organization";
  timezone: string;
  demoMode: boolean;
}

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  initials: string;
  availability: "available" | "busy" | "away" | "offline";
  capacity: { current: number; max: number };
  languages: string[];
  skills: string[];
  department: string;
  callAvailable: boolean;
}

export interface Company {
  id: ID;
  name: string;
  website?: string;
  industry: string;
  estimatedValue?: number;
}

export type LeadStage =
  | "new"
  | "qualified"
  | "opportunity"
  | "customer"
  | "churned"
  | "spam";

export interface ContactIdentity {
  channel: ChannelId;
  handle: string; // phone number, email, wa id, etc.
  verified: boolean;
}

export interface Contact {
  id: ID;
  name: string;
  company?: Company;
  identities: ContactIdentity[];
  primaryChannel: ChannelId;
  lastInteraction: ISODate;
  leadStage: LeadStage;
  ownerId?: ID;
  upcomingAppointmentId?: ID;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  tags: string[];
  notes: string;
  aiSummary: string;
  consent: { recorded: boolean; marketing: boolean };
  avatarColor: string;
  initials: string;
}

export type MessageAuthor = "customer" | "ai" | "human" | "system";

export interface Message {
  id: ID;
  conversationId: ID;
  author: MessageAuthor;
  channel: ChannelId;
  authorName: string;
  body: string;
  createdAt: ISODate;
  attachments?: { name: string; kind: string }[];
  aiConfidence?: number;
  status?: "sent" | "delivered" | "read" | "failed";
  kind?: "message" | "note" | "event" | "appointment" | "handoff";
}

export type ConversationStatus =
  | "open"
  | "unassigned"
  | "mine"
  | "waiting"
  | "ai_handling"
  | "needs_approval"
  | "snoozed"
  | "closed"
  | "spam";

export type Priority = "urgent" | "high" | "normal" | "low";

export interface Conversation {
  id: ID;
  contactId: ID;
  contactName: string;
  company?: string;
  channel: ChannelId;
  subject: string;
  preview: string;
  lastAt: ISODate;
  unread: number;
  status: ConversationStatus;
  priority: Priority;
  assigneeId?: ID;
  aiHandling: boolean;
  slaMinutes: number; // remaining
  slaBreached: boolean;
  tags: string[];
  hasAppointment: boolean;
  hasLead: boolean;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  aiConfidence?: number;
}

export interface CallTranscriptSegment {
  id: ID;
  speaker: "caller" | "ai" | "human";
  text: string;
  at: ISODate;
  confidence?: number;
}

export interface Call {
  id: ID;
  contactId: ID;
  contactName: string;
  phone: string;
  direction: "incoming" | "outgoing" | "missed" | "voicemail";
  status: "live" | "completed" | "transferred" | "failed" | "missed" | "voicemail";
  handler: "ai" | "human";
  agentId?: ID;
  startedAt: ISODate;
  durationSec: number;
  outcome?: string;
  sentiment: "positive" | "neutral" | "negative" | "unknown";
  appointmentCreatedId?: ID;
  leadStage?: LeadStage;
  hasRecording: boolean;
  transcript: CallTranscriptSegment[];
  aiSummary?: string;
  topics?: string[];
  followUps?: string[];
  qualityFlags?: string[];
  consent: boolean;
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: ID;
  contactId: ID;
  contactName: string;
  title: string;
  startAt: ISODate;
  endAt: ISODate;
  status: AppointmentStatus;
  source: ChannelId;
  assigneeId?: ID;
  channel: ChannelId;
  timezone: string;
  type: string;
  location?: string;
  notes?: string;
}

export type KnowledgeSourceStatus =
  | "synced"
  | "syncing"
  | "error"
  | "paused"
  | "draft";

export interface KnowledgeSource {
  id: ID;
  name: string;
  type: "website" | "sitemap" | "url" | "pdf" | "document" | "text" | "faq" | "notion" | "drive" | "manual";
  status: KnowledgeSourceStatus;
  lastSync: ISODate;
  records: number;
  errors?: number;
  owner: string;
  channels: ChannelId[];
}

export type AutomationStatus = "enabled" | "disabled" | "draft";

export interface Automation {
  id: ID;
  name: string;
  description: string;
  status: AutomationStatus;
  trigger: string;
  runs: number;
  lastRun: ISODate;
  steps: { kind: "trigger" | "condition" | "ai" | "action" | "delay" | "branch" | "approval" | "test"; label: string }[];
}

export interface AuditEntry {
  id: ID;
  actor: string;
  actorType: "human" | "ai" | "system";
  action: string;
  resource: string;
  at: ISODate;
  ip: string;
  result: "success" | "failure" | "warning";
  details?: string;
}

export interface Integration {
  id: ID;
  name: string;
  category: string;
  status: "demo" | "not_connected" | "connecting" | "connected" | "reauth" | "missing_perm" | "sync_delayed" | "error" | "disabled" | "planned";
  icon: string;
  lastSync?: ISODate;
}
