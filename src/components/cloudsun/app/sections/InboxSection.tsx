"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { channels, channelList, type ChannelId } from "@/config/cloudsun";
import { ChannelIcon, ChannelBadge } from "../../shared/Channel";
import { timeAgo, timeOnly, formatDateTime } from "../../shared/format";
import type { Conversation, Message, Contact, Appointment } from "@/types/domain";
import {
  demoConversations, demoContacts, demoAudit, demoAppointments,
} from "@/lib/repositories";
import { useDemoState } from "@/hooks/use-demo-state";
import { generateDentalAIResponse, rewriteText, shortenText, makeFriendlier, makeMoreFormal, translateText } from "@/lib/demo-ai";
import { team } from "@/lib/demo-store";
import {
  Search, Inbox as InboxIcon, Clock, Bot, UserCheck,
  CheckCircle2, Moon, Ban as SpamIcon, Paperclip, Sparkles, Send,
  ChevronDown, PanelRightClose, PanelRight, AlertTriangle,
  Mail, Calendar, FileText,
  RefreshCw, Wand2, Loader2, ArrowLeft, Tag,
  Users, UserPlus, Ambulance, CalendarClock, CalendarX, Shield,
  CreditCard, RotateCcw, Stethoscope, HandMetal, BookmarkPlus,
  MessageSquareText,
} from "lucide-react";

// ─── Dental intent filter groups ────────────────────────────────────────────────

interface DentalFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string; // group heading
  match: (c: Conversation) => boolean;
}

const dentalFilters: DentalFilter[] = [
  // General
  { id: "all", label: "All conversations", icon: InboxIcon, section: "General", match: () => true },
  // Patient type
  { id: "new_patients", label: "New patients", icon: UserPlus, section: "Patient type", match: (c) => c.tags.some(t => t === "new-patient" || t === "patient:new") },
  { id: "existing_patients", label: "Existing patients", icon: Users, section: "Patient type", match: (c) => c.tags.some(t => t === "existing" || t === "patient:existing") },
  // Urgency
  { id: "emergency", label: "Emergency / Urgent", icon: Ambulance, section: "Urgency", match: (c) => c.tags.some(t => t === "emergency" || t === "is_emergency") || c.priority === "urgent" },
  // Intent
  { id: "appointment_requests", label: "Appointment requests", icon: CalendarClock, section: "Intent", match: (c) => c.tags.some(t => t === "intent:new_patient_booking" || t === "appointment") },
  { id: "rescheduling", label: "Rescheduling", icon: RefreshCw, section: "Intent", match: (c) => c.tags.some(t => t === "intent:existing_patient_reschedule" || t === "reschedule") },
  { id: "cancellations", label: "Cancellations", icon: CalendarX, section: "Intent", match: (c) => c.tags.some(t => t === "intent:cancellation" || t === "cancel") },
  { id: "insurance", label: "Insurance", icon: Shield, section: "Intent", match: (c) => c.tags.some(t => t === "intent:insurance_question" || t === "insurance") },
  { id: "billing", label: "Billing", icon: CreditCard, section: "Intent", match: (c) => c.tags.some(t => t === "billing") },
  // Workflow
  { id: "recall", label: "Recall", icon: RotateCcw, section: "Workflow", match: (c) => c.tags.some(t => t === "workflow:recall" || t === "recall" || t === "recall-due" || t === "recall-overdue") },
  { id: "treatment_follow_up", label: "Treatment follow-up", icon: Stethoscope, section: "Workflow", match: (c) => c.tags.some(t => t === "workflow:treatment_follow_up" || t === "treatment-follow-up") },
  // Status
  { id: "human_requested", label: "Human requested", icon: HandMetal, section: "Status", match: (c) => c.tags.some(t => t === "requires_human" || t === "request_human") },
  { id: "needs_approval", label: "Needs approval", icon: AlertTriangle, section: "Status", match: (c) => c.status === "needs_approval" },
  { id: "ai_handling", label: "AI handling", icon: Bot, section: "Status", match: (c) => c.aiHandling && c.status !== "closed" },
  { id: "unassigned", label: "Unassigned", icon: UserCheck, section: "Status", match: (c) => !c.assigneeId },
  { id: "waiting", label: "Waiting", icon: Clock, section: "Status", match: (c) => c.status === "waiting" },
  { id: "closed", label: "Closed", icon: CheckCircle2, section: "Status", match: (c) => c.status === "closed" },
  { id: "spam", label: "Spam", icon: SpamIcon, section: "Status", match: (c) => c.tags.some(t => t === "spam") || c.status === "spam" },
];

// ─── Saved replies ──────────────────────────────────────────────────────────────

interface SavedReply {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  body: string;
}

const savedReplies: SavedReply[] = [
  {
    id: "new_patient_welcome",
    label: "New-patient welcome",
    icon: UserPlus,
    body: "Welcome to Lumen Dental Care! We're excited to meet you. Your new-patient examination is scheduled for {date}. Please arrive 10 minutes early to complete your forms. If you need to reschedule, just let us know.",
  },
  {
    id: "appointment_options",
    label: "Appointment options",
    icon: CalendarClock,
    body: "We have the following appointment slots available:\n• {date1} at {time1} with {provider1}\n• {date2} at {time2} with {provider2}\nWhich works best for you?",
  },
  {
    id: "reschedule_confirmation",
    label: "Reschedule confirmation",
    icon: RefreshCw,
    body: "Your appointment has been rescheduled to {date} at {time} with {provider}. You'll receive a confirmation shortly.",
  },
  {
    id: "cancellation_confirmation",
    label: "Cancellation confirmation",
    icon: CalendarX,
    body: "Your appointment has been cancelled. We've added you to our waitlist in case an earlier slot opens up. Would you like to book a new appointment?",
  },
  {
    id: "waitlist_invitation",
    label: "Waitlist invitation",
    icon: BookmarkPlus,
    body: "A slot has opened up! We have an appointment available on {date} at {time} with {provider}. Would you like to take it?",
  },
  {
    id: "recall_reminder",
    label: "Recall reminder",
    icon: RotateCcw,
    body: "You're due for your hygiene cleaning. Let's get you scheduled! We have slots available this week and next.",
  },
  {
    id: "treatment_follow_up",
    label: "Treatment follow-up",
    icon: Stethoscope,
    body: "Following up on your recent consultation — do you have any questions about the treatment plan, or would you like to discuss financing options?",
  },
  {
    id: "insurance_info_request",
    label: "Insurance information request",
    icon: Shield,
    body: "Could you provide your insurance provider and policy number? This will help us check your coverage before your appointment.",
  },
  {
    id: "human_follow_up",
    label: "Human follow-up",
    icon: HandMetal,
    body: "I've notified our team and someone will reach out to you shortly. Is there anything else I can help with in the meantime?",
  },
  {
    id: "after_hours",
    label: "After-hours acknowledgement",
    icon: Moon,
    body: "Thanks for reaching out! Our practice is currently closed (hours: Mon–Sat 9 AM–6 PM). If this is urgent, please contact emergency services. Otherwise, we'll follow up first thing in the morning.",
  },
];

// ─── Helper: derive dental intent from tags ─────────────────────────────────────

function getDentalIntent(tags: string[]): string | null {
  for (const t of tags) {
    if (t.startsWith("intent:")) return t.replace("intent:", "").replace(/_/g, " ");
  }
  return null;
}

function getPatientTypeFromTags(tags: string[]): string | null {
  if (tags.some(t => t === "new-patient" || t === "patient:new")) return "New patient";
  if (tags.some(t => t === "existing" || t === "patient:existing")) return "Existing patient";
  return null;
}

function isEmergencyConv(tags: string[], priority: string): boolean {
  return tags.some(t => t === "emergency" || t === "is_emergency") || priority === "urgent";
}

// ─── Suggested next action ───────────────────────────────────────────────────────

function suggestNextAction(contact: Contact | undefined, conv: Conversation): string | null {
  if (!contact) return null;
  if (isEmergencyConv(conv.tags, conv.priority)) return "Escalate to on-call dentist";
  if (conv.status === "needs_approval") return "Review and approve AI response";
  if (conv.tags.some(t => t === "requires_human" || t === "request_human")) return "Assign to available team member";
  if (contact.recallStatus === "overdue" || contact.recallStatus === "due_now") return "Schedule recall appointment";
  if (contact.waitlistStatus === "waiting") return "Check for open slots";
  if (contact.treatmentFollowUpStatus === "follow_up_due") return "Send treatment follow-up";
  if (contact.patientStatus === "new_lead") return "Complete new-patient intake";
  if (conv.status === "waiting" && !conv.assigneeId) return "Assign conversation";
  return null;
}

// ─── Main component ──────────────────────────────────────────────────────────────

export function InboxView() {
  return <InboxSection />;
}

export function InboxSection() {
  const state = useDemoState();
  const router = useRouter();
  const params = useParams<{ conversationId?: string }>();
  const conversationId = params?.conversationId;

  const [filter, setFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState<ChannelId | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [composer, setComposer] = useState("");
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [showContext, setShowContext] = useState(true);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [savedRepliesOpen, setSavedRepliesOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get the current active filter definition
  const activeFilterDef = dentalFilters.find(f => f.id === filter) ?? dentalFilters[0];

  // Filter conversations with dental-aware logic
  const filtered = useMemo(() => {
    return state.conversations.filter((c) => {
      // Apply the dental filter
      if (!activeFilterDef.match(c)) return false;
      // Channel filter
      if (channelFilter !== "all" && c.channel !== channelFilter) return false;
      // Priority filter
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.contactName.toLowerCase().includes(q) &&
          !c.preview.toLowerCase().includes(q) &&
          !c.subject.toLowerCase().includes(q) &&
          !c.tags.some(t => t.toLowerCase().includes(q))
        ) return false;
      }
      return true;
    });
  }, [state.conversations, activeFilterDef, channelFilter, priorityFilter, search]);

  const selectedConv = conversationId
    ? state.conversations.find((c) => c.id === conversationId)
    : filtered[0];
  const messages = selectedConv ? demoConversations.getMessages(selectedConv.id) : [];
  const contact = selectedConv ? demoContacts.getById(selectedConv.contactId) : undefined;

  // Find the team member for assignee
  const assignee = selectedConv?.assigneeId
    ? team.find(t => t.id === selectedConv.assigneeId)
    : undefined;

  // Find next appointment for the contact
  const nextAppointment = useMemo(() => {
    if (!contact) return undefined;
    const contactId = contact.id;
    const now = Date.now();
    return state.appointments
      .filter(a => a.contactId === contactId && a.status !== "cancelled" && new Date(a.startAt).getTime() > now - 86400000)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0];
  }, [state.appointments, contact]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function selectConversation(id: string) {
    router.push(`/app/inbox/${id}`);
  }

  const sendMessage = useCallback(() => {
    if (!composer.trim() || !selectedConv) return;
    const convId = selectedConv.id;
    const channel = selectedConv.channel;
    const contactName = selectedConv.contactName;
    const now = new Date().toISOString();
    const msg: Message = {
      id: `m_${Date.now()}`,
      conversationId: convId,
      author: "human",
      channel: channel,
      authorName: "Priya Sharma",
      body: composer,
      createdAt: now,
      kind: composerMode === "note" ? "note" : "message",
      status: "sent",
    };
    demoConversations.appendMessage(convId, msg);
    // Also update the conversation's preview and lastAt for persistence
    demoConversations.update(convId, {
      preview: composerMode === "note" ? selectedConv.preview : composer.slice(0, 100),
      lastAt: now,
      unread: 0,
    });
    demoAudit.add({
      id: `al_${Date.now()}`,
      actor: "Priya Sharma",
      actorType: "human",
      action: composerMode === "note" ? "Added internal note" : "Sent reply",
      resource: `Conversation ${convId}`,
      at: now,
      ip: "203.0.113.42",
      result: "success",
      details: `Channel: ${channel}`,
    });
    setComposer("");

    // Simulated AI auto-response for customer-facing replies (not notes)
    if (composerMode === "reply") {
      const replyText = composer;
      setTimeout(() => {
        const ai = generateDentalAIResponse(replyText, channel, contactName);
        const aiMsg: Message = {
          id: `m_${Date.now() + 1}`,
          conversationId: convId,
          author: "ai",
          channel: channel,
          authorName: "CloudSun AI (simulated)",
          body: ai.text,
          createdAt: new Date().toISOString(),
          aiConfidence: ai.confidence,
          status: "sent",
          kind: "message",
        };
        demoConversations.appendMessage(convId, aiMsg);
        demoConversations.update(convId, {
          preview: ai.text.slice(0, 100),
          lastAt: aiMsg.createdAt,
        });
        demoAudit.add({
          id: `al_${Date.now() + 2}`,
          actor: "CloudSun AI",
          actorType: "ai",
          action: "Sent simulated reply",
          resource: `Conversation ${convId}`,
          at: new Date().toISOString(),
          ip: "ai-worker",
          result: "success",
          details: `Intent: ${ai.intent}. Confidence: ${Math.round(ai.confidence * 100)}%. Simulated.`,
        });
      }, 1200);
    }
  }, [composer, composerMode, selectedConv]);

  function handleAiDraft() {
    if (!selectedConv) return;
    setAiDrafting(true);
    setTimeout(() => {
      const ai = generateDentalAIResponse(
        selectedConv.preview,
        selectedConv.channel,
        selectedConv.contactName,
      );
      setComposer(ai.text);
      setAiDrafting(false);
      composerRef.current?.focus();
    }, 900);
  }

  function handleSavedReply(reply: SavedReply) {
    setComposer(reply.body);
    setSavedRepliesOpen(false);
    composerRef.current?.focus();
  }

  function handleHandoffToHuman() {
    if (!selectedConv) return;
    const now = new Date().toISOString();
    const handoffMsg: Message = {
      id: `m_${Date.now()}`,
      conversationId: selectedConv.id,
      author: "system",
      channel: selectedConv.channel,
      authorName: "System",
      body: "Conversation handed off to human team member. AI handling disabled.",
      createdAt: now,
      kind: "handoff",
      status: "sent",
    };
    demoConversations.appendMessage(selectedConv.id, handoffMsg);
    demoConversations.update(selectedConv.id, {
      aiHandling: false,
      status: !selectedConv.assigneeId ? "unassigned" : "waiting",
    });
    // Add "requires_human" tag if not already present
    if (!selectedConv.tags.includes("requires_human")) {
      const newTags = [...selectedConv.tags, "requires_human"];
      demoConversations.update(selectedConv.id, { tags: newTags });
    }
    demoAudit.add({
      id: `al_${Date.now() + 1}`,
      actor: "Priya Sharma",
      actorType: "human",
      action: "Handed off to human",
      resource: `Conversation ${selectedConv.id}`,
      at: now,
      ip: "203.0.113.42",
      result: "success",
      details: `AI handling disabled. Status set to ${!selectedConv.assigneeId ? "unassigned" : "waiting"}.`,
    });
  }

  function bulkAction(action: "close" | "snooze" | "assign" | "spam") {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    const now = new Date().toISOString();
    const patch: Partial<Conversation> = action === "close"
      ? { status: "closed" }
      : action === "snooze"
        ? { status: "snoozed" }
        : action === "spam"
          ? { status: "spam" }
          : {};
    demoConversations.bulkUpdate(ids, patch);
    demoAudit.add({
      id: `al_${Date.now()}`,
      actor: "Priya Sharma",
      actorType: "human",
      action: `Bulk ${action} on ${ids.length} conversations`,
      resource: ids.join(", "),
      at: now,
      ip: "203.0.113.42",
      result: "success",
    });
    setSelected(new Set());
  }

  // Count conversations per filter
  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: state.conversations.length };
    for (const f of dentalFilters) {
      if (f.id === "all") continue;
      counts[f.id] = state.conversations.filter(c => f.match(c)).length;
    }
    return counts;
  }, [state.conversations]);

  // Group filters by section for sidebar rendering
  const filterSections = useMemo(() => {
    const sections: { title: string; filters: DentalFilter[] }[] = [];
    let currentSection = "";
    for (const f of dentalFilters) {
      const section = f.section ?? "General";
      if (section !== currentSection) {
        sections.push({ title: section, filters: [f] });
        currentSection = section;
      } else {
        sections[sections.length - 1].filters.push(f);
      }
    }
    return sections;
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — dental filters */}
      <div className={`hidden shrink-0 flex-col border-r border-border bg-sidebar/50 xl:flex ${sidebarCollapsed ? "w-12" : "w-56"}`}>
        <div className="border-b border-border p-3">
          {!sidebarCollapsed && (
            <Input
              placeholder="Search conversations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 bg-background text-xs"
            />
          )}
          <button
            onClick={() => setSidebarCollapsed(v => !v)}
            className="mt-1 flex w-full items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sidebarCollapsed ? "rotate-90" : "-rotate-90"}`} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin">
          {!sidebarCollapsed && filterSections.map((section) => (
            <div key={section.title}>
              <div className="mb-1 mt-3 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground first:mt-1">{section.title}</div>
              {section.filters.map((f) => {
                const count = filterCounts[f.id] ?? 0;
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${active ? "bg-sidebar-accent font-medium text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}
                  >
                    <f.icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate text-left">{f.label}</span>
                    {count > 0 && <span className="text-[10px] text-muted-foreground">{count}</span>}
                  </button>
                );
              })}
            </div>
          ))}

          {!sidebarCollapsed && (
            <>
              <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Channels</div>
              <button onClick={() => setChannelFilter("all")} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${channelFilter === "all" ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}>
                <span className="h-2 w-2 rounded-full bg-muted-foreground" /> All channels
              </button>
              {channelList.map((c) => (
                <button key={c.id} onClick={() => setChannelFilter(c.id)} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${channelFilter === c.id ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} /> {c.label}
                </button>
              ))}

              <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Priority</div>
              {["all", "urgent", "high", "normal", "low"].map((p) => (
                <button key={p} onClick={() => setPriorityFilter(p)} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs capitalize ${priorityFilter === p ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}>
                  {p === "all" ? "All priorities" : p}
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Middle panel — conversation list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-background md:w-80">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div className="text-sm font-medium">{filtered.length} conversation{filtered.length !== 1 ? "s" : ""}</div>
          {selected.size > 0 && (
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => bulkAction("assign")}>Assign</Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => bulkAction("snooze")}>Snooze</Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px]" onClick={() => bulkAction("close")}>Close</Button>
              <Button variant="outline" size="sm" className="h-6 text-[10px] text-[oklch(0.62_0.16_42)]" onClick={() => bulkAction("spam")}>Spam</Button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin">
          {filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <InboxIcon className="h-8 w-8 text-muted-foreground/50" />
              <div className="mt-3 text-sm font-medium">No conversations</div>
              <div className="mt-1 text-xs text-muted-foreground">Try a different filter.</div>
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationListItem
                key={c.id}
                conv={c}
                active={selectedConv?.id === c.id}
                checked={selected.has(c.id)}
                onCheck={(checked) => {
                  const next = new Set(selected);
                  if (checked) next.add(c.id); else next.delete(c.id);
                  setSelected(next);
                }}
                onClick={() => selectConversation(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main panel — conversation */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {selectedConv ? (
          <>
            {/* Conversation header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/app/inbox" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted xl:hidden" aria-label="Back to inbox">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <Avatar className="h-9 w-9">
                  <AvatarFallback style={{ backgroundColor: contact?.avatarColor ?? "oklch(0.5 0 0)", color: "white" }} className="text-xs">
                    {contact?.initials ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/app/patients/${selectedConv.contactId}`} className="truncate text-sm font-medium hover:underline">
                      {selectedConv.contactName}
                    </Link>
                    <ChannelBadge id={selectedConv.channel} withLabel />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {selectedConv.company && <span className="truncate">{selectedConv.company}</span>}
                    {selectedConv.aiHandling && <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" /> AI handling (simulated)</span>}
                    {isEmergencyConv(selectedConv.tags, selectedConv.priority) && (
                      <span className="inline-flex items-center gap-1 text-[oklch(0.62_0.16_42)]"><Ambulance className="h-3 w-3" /> Emergency</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedConv.priority === "urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
                {selectedConv.slaBreached && <Badge variant="outline" className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA breached</Badge>}
                {/* Dental intent badge */}
                {getDentalIntent(selectedConv.tags) && (
                  <Badge variant="outline" className="text-[9px]">
                    <Tag className="mr-1 h-2.5 w-2.5" />
                    {getDentalIntent(selectedConv.tags)}
                  </Badge>
                )}
                {/* Patient type badge */}
                {getPatientTypeFromTags(selectedConv.tags) && (
                  <Badge variant="secondary" className="text-[9px]">
                    {getPatientTypeFromTags(selectedConv.tags)}
                  </Badge>
                )}
                {/* Hand off to human button */}
                {selectedConv.aiHandling && (
                  <Button variant="ghost" size="sm" className="h-8 text-[11px]" onClick={handleHandoffToHuman}>
                    <HandMetal className="h-3 w-3" /> Hand off
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-8 text-[11px]" onClick={() => demoConversations.update(selectedConv.id, { status: "closed" })}>
                  <CheckCircle2 className="h-3 w-3" /> Close
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowContext((v) => !v)}>
                  {showContext ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto bg-muted/20 scroll-thin">
              <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
                <div className="flex items-center justify-center">
                  <span className="rounded-full bg-background px-3 py-1 text-[10px] text-muted-foreground shadow-soft">
                    {formatDateTime(messages[0]?.createdAt ?? selectedConv.lastAt)}
                  </span>
                </div>
                {/* Show dental tags/intent info banner if relevant */}
                {isEmergencyConv(selectedConv.tags, selectedConv.priority) && (
                  <div className="flex items-center gap-2 rounded-lg border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/5 px-3 py-2 text-xs">
                    <AlertTriangle className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                    <span className="text-[oklch(0.62_0.16_42)]">Emergency / urgent conversation — requires immediate attention</span>
                  </div>
                )}
                {selectedConv.tags.some(t => t === "requires_human" || t === "request_human") && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-50/40 px-3 py-2 text-xs dark:bg-amber-900/10">
                    <HandMetal className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700 dark:text-amber-400">Patient has requested to speak with a human</span>
                  </div>
                )}
                {messages.map((m, i) => {
                  const isNew = i === messages.length - 1 && m.id.startsWith("m_");
                  return <MessageBubble key={m.id} message={m} isNew={isNew} />;
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Composer area */}
            <div className="shrink-0 border-t border-border bg-background p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <button onClick={() => setComposerMode("reply")} className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "reply" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>Reply</button>
                <button onClick={() => setComposerMode("note")} className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "note" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>Internal note</button>
                <div className="ml-auto flex items-center gap-1">
                  {/* Saved replies */}
                  <Popover open={savedRepliesOpen} onOpenChange={setSavedRepliesOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
                        <MessageSquareText className="h-3 w-3" /> Saved replies
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-0">
                      <div className="border-b border-border px-3 py-2">
                        <div className="text-xs font-medium">Dental saved replies</div>
                        <div className="text-[10px] text-muted-foreground">Select a reply to insert into the composer</div>
                      </div>
                      <div className="max-h-80 overflow-y-auto scroll-thin">
                        {savedReplies.map((reply) => (
                          <button
                            key={reply.id}
                            onClick={() => handleSavedReply(reply)}
                            className="flex w-full items-start gap-2 border-b border-border/50 px-3 py-2 text-left transition-colors hover:bg-muted/50 last:border-0"
                          >
                            <reply.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium">{reply.label}</div>
                              <div className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">{reply.body}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={handleAiDraft} disabled={aiDrafting}>
                    {aiDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} AI draft
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => rewriteText(c))} disabled={!composer}>Rewrite</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => shortenText(c))} disabled={!composer}>Shorten</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => makeFriendlier(c))} disabled={!composer}>Friendlier</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => makeMoreFormal(c))} disabled={!composer}>More formal</Button>
                </div>
              </div>
              <div className={`rounded-xl border ${composerMode === "note" ? "border-amber-300/50 bg-amber-50/30" : "border-border bg-background"}`}>
                <Textarea
                  ref={composerRef}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendMessage(); }}
                  placeholder={composerMode === "note" ? "Write a note for your team…" : "Write a reply… (Ctrl+Enter to send)"}
                  className="min-h-[80px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Attach"><Paperclip className="h-3.5 w-3.5" /></button>
                    <button className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:bg-muted">
                      <Mail className="h-3 w-3" /> {channels[selectedConv.channel].short}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => translateText(c, "Hindi"))} disabled={!composer}>Translate</Button>
                    <Button size="sm" className="h-7 gap-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={sendMessage} disabled={!composer.trim()}>
                      <Send className="h-3 w-3" /> {composerMode === "note" ? "Add note" : "Send"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <InboxIcon className="h-10 w-10 text-muted-foreground/40" />
            <div className="mt-3 text-sm font-medium">Select a conversation</div>
          </div>
        )}
      </div>

      {/* Right panel — context */}
      <AnimatePresence>
      {selectedConv && showContext && (
        <m.div
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
          className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-background scroll-thin lg:flex"
        >
          <DentalContextPanel
            contactId={selectedConv.contactId}
            conv={selectedConv}
            nextAppointment={nextAppointment}
            assignee={assignee}
          />
        </m.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ─── Conversation list item with dental indicators ─────────────────────────────

function ConversationListItem({ conv, active, checked, onCheck, onClick }: { conv: Conversation; active: boolean; checked: boolean; onCheck: (c: boolean) => void; onClick: () => void }) {
  const contact = demoContacts.getById(conv.contactId);

  return (
    <div className={`flex items-start gap-2 border-b border-border/60 px-3 py-3 transition-colors ${active ? "bg-muted/60" : "hover:bg-muted/30"}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheck(e.target.checked)}
        onClick={(e) => e.stopPropagation()}
        className="mt-1.5 h-3.5 w-3.5 accent-[oklch(0.62_0.16_42)]"
        aria-label={`Select ${conv.contactName}`}
      />
      <button onClick={onClick} className="flex min-w-0 flex-1 flex-col gap-1.5 text-left">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-[10px]" style={{ backgroundColor: conv.aiHandling ? "oklch(0.62 0.16 42)" : (contact?.avatarColor ?? "oklch(0.5 0 0)"), color: "white" }}>
                {conv.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background">
              <ChannelIcon id={conv.channel} className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="truncate text-sm font-medium">{conv.contactName}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(conv.lastAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {conv.aiHandling && <Bot className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />}
              {isEmergencyConv(conv.tags, conv.priority) && <Ambulance className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />}
              <span className="truncate text-[11px] text-muted-foreground">{conv.preview}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pl-10">
          {conv.priority === "urgent" && <Badge variant="destructive" className="h-4 px-1 text-[9px]">Urgent</Badge>}
          {conv.unread > 0 && <span className="rounded-full bg-[oklch(0.62_0.16_42)] px-1.5 text-[9px] font-medium text-white">{conv.unread}</span>}
          {conv.slaBreached && <span className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA</span>}
          {conv.hasAppointment && <Calendar className="h-3 w-3 text-muted-foreground" />}
          {conv.hasLead && <span className="text-[9px] text-muted-foreground">lead</span>}
          {conv.tags.some(t => t === "requires_human") && (
            <Badge variant="outline" className="h-4 px-1 text-[9px] text-amber-600"><HandMetal className="mr-0.5 h-2.5 w-2.5" />Human</Badge>
          )}
          {conv.tags.some(t => t === "new-patient") && (
            <Badge variant="secondary" className="h-4 px-1 text-[9px]"><UserPlus className="mr-0.5 h-2.5 w-2.5" />New</Badge>
          )}
          {conv.tags.some(t => t === "recall" || t === "recall-due" || t === "recall-overdue") && (
            <Badge variant="outline" className="h-4 px-1 text-[9px]"><RotateCcw className="mr-0.5 h-2.5 w-2.5" />Recall</Badge>
          )}
          {conv.tags.some(t => t === "treatment-follow-up") && (
            <Badge variant="outline" className="h-4 px-1 text-[9px]"><Stethoscope className="mr-0.5 h-2.5 w-2.5" />F/U</Badge>
          )}
        </div>
      </button>
    </div>
  );
}

// ─── Message bubble ──────────────────────────────────────────────────────────────

function MessageBubble({ message, isNew = false }: { message: Message; isNew?: boolean }) {
  const reduced = useReducedMotion();
  const entrance = !reduced && isNew
    ? { initial: { opacity: 0, y: 10, scale: 0.99 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } }
    : {};

  if (message.kind === "handoff" || message.author === "system") {
    return (
      <m.div className="flex items-center justify-center" {...entrance}>
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground shadow-soft">
          <AlertTriangle className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />
          {message.body}
        </div>
      </m.div>
    );
  }
  if (message.kind === "note") {
    return (
      <m.div className="flex justify-center" {...entrance}>
        <div className="max-w-md rounded-lg border border-amber-300/40 bg-amber-50/40 px-3 py-2 text-xs">
          <div className="mb-0.5 font-medium text-amber-900">{message.authorName}</div>
          <div className="text-amber-900/80">{message.body}</div>
        </div>
      </m.div>
    );
  }
  const isCustomer = message.author === "customer";
  const isAi = message.author === "ai";
  return (
    <m.div className={`flex ${isCustomer ? "justify-start" : "justify-end"}`} {...entrance}>
      <div className={`max-w-[75%] ${isCustomer ? "" : "text-right"}`}>
        <div className={`mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground ${isCustomer ? "" : "justify-end"}`}>
          {isAi && <Bot className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />}
          <span>{message.authorName}</span>
          <span>·</span>
          <span>{timeOnly(message.createdAt)}</span>
        </div>
        <div className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
          isCustomer ? "rounded-tl-md bg-card text-foreground shadow-soft"
            : isAi ? "rounded-tr-md bg-[oklch(0.62_0.16_42)]/10 text-foreground ring-1 ring-[oklch(0.62_0.16_42)]/20"
            : "rounded-tr-md bg-primary text-primary-foreground"
        }`}>
          {message.body}
        </div>
        {isAi && message.aiConfidence !== undefined && (
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <Sparkles className="h-2.5 w-2.5" /> Simulated · confidence {Math.round(message.aiConfidence * 100)}%
          </div>
        )}
      </div>
    </m.div>
  );
}

// ─── Dental Context Panel ────────────────────────────────────────────────────────

function DentalContextPanel({
  contactId,
  conv,
  nextAppointment,
  assignee,
}: {
  contactId: string;
  conv: Conversation;
  nextAppointment: Appointment | undefined;
  assignee: { id: string; name: string; initials: string; avatarColor: string; role: string; availability: string } | undefined;
}) {
  const contact = demoContacts.getById(contactId);
  if (!contact) return null;

  const suggestedAction = suggestNextAction(contact, conv);

  // Patient status display
  const patientStatusColors: Record<string, string> = {
    new_lead: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    new_patient: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    existing_patient: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    archived: "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-500",
  };

  // Recall status display
  const recallStatusLabels: Record<string, string> = {
    not_due: "Not due",
    due_soon: "Due soon",
    due_now: "Due now",
    overdue: "Overdue",
    contacted: "Contacted",
    responded: "Responded",
    booked: "Booked",
    declined: "Declined",
    do_not_contact: "Do not contact",
  };

  const recallStatusColors: Record<string, string> = {
    not_due: "text-muted-foreground",
    due_soon: "text-amber-600",
    due_now: "text-[oklch(0.62_0.16_42)]",
    overdue: "text-red-600",
    contacted: "text-blue-600",
    responded: "text-green-600",
    booked: "text-emerald-600",
    declined: "text-gray-500",
    do_not_contact: "text-gray-400",
  };

  // Waitlist status labels
  const waitlistLabels: Record<string, string> = {
    not_on_waitlist: "Not on waitlist",
    waiting: "Waiting",
    invited: "Invited",
    accepted: "Accepted",
    declined: "Declined",
    filled: "Filled",
  };

  // Treatment follow-up status labels
  const followUpLabels: Record<string, string> = {
    none: "None",
    follow_up_due: "Follow-up due",
    first_message: "First message sent",
    patient_responded: "Patient responded",
    question_pending: "Question pending",
    coordinator_required: "Coordinator required",
    appointment_booked: "Appointment booked",
    not_ready: "Not ready",
    declined: "Declined",
    closed: "Closed",
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback style={{ backgroundColor: contact.avatarColor, color: "white" }} className="text-lg">
            {contact.initials}
          </AvatarFallback>
        </Avatar>
        <Link href={`/app/patients/${contact.id}`} className="mt-3 font-serif text-lg hover:underline">{contact.name}</Link>
        {contact.preferredName && contact.preferredName !== contact.name && (
          <div className="text-xs text-muted-foreground">Prefers: {contact.preferredName}</div>
        )}
        {contact.company && <div className="text-xs text-muted-foreground">{contact.company.name}</div>}

        {/* Patient status badge */}
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${patientStatusColors[contact.patientStatus] ?? "bg-gray-100 text-gray-800"}`}>
            {contact.patientStatus.replace(/_/g, " ")}
          </span>
          <Badge variant="outline" className="text-[10px] capitalize">{contact.leadStage}</Badge>
          {contact.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
          ))}
        </div>

        {/* Suggested next action */}
        {suggestedAction && (
          <div className="mt-3 w-full rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-left">
            <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">Suggested next action</div>
            <div className="text-xs font-medium text-foreground">{suggestedAction}</div>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-3">
        {/* Identities */}
        <div>
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Identities</div>
          {contact.identities.map((id) => (
            <div key={`${id.channel}-${id.handle}`} className="flex items-center gap-2 py-1 text-xs">
              <ChannelIcon id={id.channel} className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 truncate">{id.handle}</span>
              {id.verified && <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />}
            </div>
          ))}
        </div>

        {/* Dental patient information */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Patient information</div>
          <div className="space-y-1.5">
            {/* Preferred location */}
            {contact.preferredLocation && (
              <ContextRow icon="📍" label="Preferred location" value={contact.preferredLocation} />
            )}
            {/* Preferred dentist */}
            {contact.preferredDentist && (
              <ContextRow icon="🦷" label="Preferred dentist" value={contact.preferredDentist} />
            )}
            {/* Last visit */}
            {contact.lastVisitAt && (
              <ContextRow icon="📅" label="Last visit" value={formatDateTime(contact.lastVisitAt)} />
            )}
            {/* Preferred channel */}
            <ContextRow icon="💬" label="Preferred channel" value={channels[contact.primaryChannel]?.label ?? contact.primaryChannel} />
            {/* Assigned staff */}
            {contact.ownerId && (
              <ContextRow
                icon="👤"
                label="Assigned staff"
                value={team.find(t => t.id === contact.ownerId)?.name ?? contact.ownerId}
              />
            )}
            {/* Conversation assignee */}
            {assignee && (
              <ContextRow
                icon="📋"
                label="Conversation assigned to"
                value={assignee.name}
              />
            )}
          </div>
        </div>

        {/* Next appointment */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Next appointment</div>
          {nextAppointment ? (
            <Link href="/app/calendar" className="block rounded-lg border border-border bg-muted/30 px-3 py-2 transition-colors hover:bg-muted/60">
              <div className="text-xs font-medium">{nextAppointment.title}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {formatDateTime(nextAppointment.startAt)} · {nextAppointment.location ?? "No location"}
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                With {team.find(t => t.id === nextAppointment.assigneeId)?.name ?? nextAppointment.assigneeId ?? "TBD"}
              </div>
              <Badge variant="outline" className="mt-1 text-[9px] capitalize">{nextAppointment.status}</Badge>
            </Link>
          ) : (
            <div className="text-xs text-muted-foreground">No upcoming appointment</div>
          )}
        </div>

        {/* Recall status */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Recall status</div>
          <div className="flex items-center gap-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={`font-medium ${recallStatusColors[contact.recallStatus] ?? ""}`}>
              {recallStatusLabels[contact.recallStatus] ?? contact.recallStatus}
            </span>
            {contact.recallDueAt && (
              <span className="text-[10px] text-muted-foreground">Due: {formatDateTime(contact.recallDueAt)}</span>
            )}
          </div>
        </div>

        {/* Waitlist status */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Waitlist status</div>
          <div className="flex items-center gap-2 text-xs">
            <BookmarkPlus className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={contact.waitlistStatus !== "not_on_waitlist" ? "font-medium text-amber-600" : "text-muted-foreground"}>
              {waitlistLabels[contact.waitlistStatus] ?? contact.waitlistStatus}
            </span>
          </div>
        </div>

        {/* Treatment follow-up status */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Treatment follow-up</div>
          <div className="flex items-center gap-2 text-xs">
            <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={contact.treatmentFollowUpStatus !== "none" ? "font-medium text-blue-600" : "text-muted-foreground"}>
              {followUpLabels[contact.treatmentFollowUpStatus] ?? contact.treatmentFollowUpStatus}
            </span>
          </div>
        </div>

        {/* Insurance */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Insurance</div>
          {contact.insuranceProvider ? (
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{contact.insuranceProvider}</span>
              {contact.paymentType && (
                <Badge variant="outline" className="text-[9px] capitalize">{contact.paymentType.replace(/_/g, " ")}</Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>No insurance on file</span>
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Consent</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              {contact.consent.recorded
                ? <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />
                : <AlertTriangle className="h-3 w-3 text-amber-500" />}
              Recording
            </span>
            <span className="flex items-center gap-1">
              {contact.consent.marketing
                ? <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />
                : <AlertTriangle className="h-3 w-3 text-amber-500" />}
              Marketing
            </span>
          </div>
        </div>

        {/* AI confidence */}
        {conv.aiConfidence !== undefined && (
          <div className="border-t border-border pt-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI confidence</div>
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={`font-medium ${conv.aiConfidence >= 0.8 ? "text-[oklch(0.45_0.08_155)]" : conv.aiConfidence >= 0.6 ? "text-amber-600" : "text-[oklch(0.62_0.16_42)]"}`}>
                {Math.round(conv.aiConfidence * 100)}%
              </span>
              <div className="h-1.5 flex-1 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${conv.aiConfidence >= 0.8 ? "bg-[oklch(0.45_0.08_155)]" : conv.aiConfidence >= 0.6 ? "bg-amber-500" : "bg-[oklch(0.62_0.16_42)]"}`}
                  style={{ width: `${conv.aiConfidence * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* AI summary */}
        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI summary (simulated)</div>
          <p className="text-xs leading-relaxed text-foreground/80">{contact.aiSummary}</p>
        </div>

        {/* Notes */}
        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</div>
          <p className="text-xs leading-relaxed text-foreground/70">{contact.notes}</p>
        </div>

        {/* Quick actions */}
        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link href="/app/calendar"><Button variant="outline" size="sm" className="h-7 text-[11px]"><Calendar className="h-3 w-3" /> Book</Button></Link>
            <Link href={`/app/patients/${contact.id}`}><Button variant="outline" size="sm" className="h-7 text-[11px]"><FileText className="h-3 w-3" /> Profile</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Context row helper ──────────────────────────────────────────────────────────

function ContextRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="shrink-0 text-sm" role="img" aria-hidden="true">{icon}</span>
      <span className="text-muted-foreground">{label}:</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}
