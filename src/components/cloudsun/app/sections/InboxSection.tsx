"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { m, AnimatePresence, useReducedMotion } from "motion/react";
import { SectionScroll } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { channels, channelList, type ChannelId } from "@/config/cloudsun";
import { ChannelIcon, ChannelBadge } from "../../shared/Channel";
import { timeAgo, timeOnly, formatDateTime } from "../../shared/format";
import type { Conversation, Message } from "@/types/domain";
import {
  demoConversations, demoContacts, demoAudit,
} from "@/lib/repositories";
import { useDemoState } from "@/hooks/use-demo-state";
import { generateDentalAIResponse, rewriteText, shortenText, makeFriendlier, makeMoreFormal, translateText } from "@/lib/demo-ai";
import {
  Search, Filter, Inbox as InboxIcon, Star, Clock, Bot, UserCheck,
  CheckCircle2, Moon, Archive, Ban as SpamIcon, Paperclip, Sparkles, Send,
  Smile, ChevronDown, PanelRightClose, PanelRight, AlertTriangle,
  Mail, MessageCircle, MessageSquare, Phone, Calendar, FileText,
  RefreshCw, Wand2, Loader2, ArrowLeft, Trash2, Tag,
} from "lucide-react";

const filterGroups = [
  { id: "all", label: "All conversations", icon: InboxIcon },
  { id: "unassigned", label: "Unassigned", icon: UserCheck },
  { id: "mine", label: "Mine", icon: Star },
  { id: "waiting", label: "Waiting", icon: Clock },
  { id: "ai_handling", label: "AI handling", icon: Bot },
  { id: "needs_approval", label: "Needs approval", icon: AlertTriangle },
  { id: "snoozed", label: "Snoozed", icon: Moon },
  { id: "closed", label: "Closed", icon: CheckCircle2 },
  { id: "spam", label: "Spam", icon: SpamIcon },
];

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

  const filtered = useMemo(() => {
    return state.conversations.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (channelFilter !== "all" && c.channel !== channelFilter) return false;
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.contactName.toLowerCase().includes(q) && !c.preview.toLowerCase().includes(q) && !c.subject.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.conversations, filter, channelFilter, priorityFilter, search]);

  const selectedConv = conversationId
    ? state.conversations.find((c) => c.id === conversationId)
    : filtered[0];
  const messages = selectedConv ? demoConversations.getMessages(selectedConv.id) : [];
  const contact = selectedConv ? demoContacts.getById(selectedConv.contactId) : undefined;
  const assignee = selectedConv?.assigneeId
    ? state.conversations // team is static
    : undefined;

  function selectConversation(id: string) {
    router.push(`/app/inbox/${id}`);
  }

  function sendMessage() {
    if (!composer.trim() || !selectedConv) return;
    const now = new Date().toISOString();
    const msg: Message = {
      id: `m_${Date.now()}`,
      conversationId: selectedConv.id,
      author: composerMode === "note" ? "human" : "human",
      channel: selectedConv.channel,
      authorName: "Amara Iyer",
      body: composer,
      createdAt: now,
      kind: composerMode === "note" ? "note" : "message",
      status: "sent",
    };
    demoConversations.appendMessage(selectedConv.id, msg);
    demoAudit.add({
      id: `al_${Date.now()}`,
      actor: "Amara Iyer",
      actorType: "human",
      action: composerMode === "note" ? "Added internal note" : "Sent reply",
      resource: `Conversation ${selectedConv.id}`,
      at: now,
      ip: "203.0.113.42",
      result: "success",
      details: `Channel: ${selectedConv.channel}`,
    });
    setComposer("");

    // Simulated AI auto-response for customer-facing replies (not notes)
    if (composerMode === "reply") {
      setTimeout(() => {
        const ai = generateDentalAIResponse(composer, selectedConv.channel, selectedConv.contactName);
        const aiMsg: Message = {
          id: `m_${Date.now() + 1}`,
          conversationId: selectedConv.id,
          author: "ai",
          channel: selectedConv.channel,
          authorName: "CloudSun AI (simulated)",
          body: ai.text,
          createdAt: new Date().toISOString(),
          aiConfidence: ai.confidence,
          status: "sent",
          kind: "message",
        };
        demoConversations.appendMessage(selectedConv.id, aiMsg);
        demoAudit.add({
          id: `al_${Date.now() + 2}`,
          actor: "CloudSun AI",
          actorType: "ai",
          action: "Sent simulated reply",
          resource: `Conversation ${selectedConv.id}`,
          at: new Date().toISOString(),
          ip: "ai-worker",
          result: "success",
          details: `Intent: ${ai.intent}. Confidence: ${Math.round(ai.confidence * 100)}%. Simulated.`,
        });
      }, 1200);
    }
  }

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
    }, 900);
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
      actor: "Amara Iyer",
      actorType: "human",
      action: `Bulk ${action} on ${ids.length} conversations`,
      resource: ids.join(", "),
      at: now,
      ip: "203.0.113.42",
      result: "success",
    });
    setSelected(new Set());
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left panel — filters */}
      <div className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar/50 xl:flex">
        <div className="border-b border-border p-3">
          <Input
            placeholder="Search conversations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-background text-xs"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 scroll-thin">
          <div className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</div>
          {filterGroups.map((f) => {
            const count = f.id === "all" ? state.conversations.length : state.conversations.filter((c) => c.status === f.id).length;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors ${active ? "bg-sidebar-accent font-medium text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}
              >
                <f.icon className="h-3.5 w-3.5" />
                <span className="flex-1 truncate text-left">{f.label}</span>
                {count > 0 && <span className="text-[10px] text-muted-foreground">{count}</span>}
              </button>
            );
          })}

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
                    <Link href={`/app/contacts/${selectedConv.contactId}`} className="truncate text-sm font-medium hover:underline">
                      {selectedConv.contactName}
                    </Link>
                    <ChannelBadge id={selectedConv.channel} withLabel />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {selectedConv.company && <span className="truncate">{selectedConv.company}</span>}
                    {selectedConv.aiHandling && <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" /> AI handling (simulated)</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedConv.priority === "urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
                {selectedConv.slaBreached && <Badge variant="outline" className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA breached</Badge>}
                <Button variant="ghost" size="sm" className="h-8 text-[11px]" onClick={() => demoConversations.update(selectedConv.id, { status: "closed" })}>
                  <CheckCircle2 className="h-3 w-3" /> Close
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowContext((v) => !v)}>
                  {showContext ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/20 scroll-thin">
              <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
                <div className="flex items-center justify-center">
                  <span className="rounded-full bg-background px-3 py-1 text-[10px] text-muted-foreground shadow-soft">
                    {formatDateTime(messages[0]?.createdAt ?? selectedConv.lastAt)}
                  </span>
                </div>
                {messages.map((m, i) => {
                  const isNew = i === messages.length - 1 && m.id.startsWith("m_");
                  return <MessageBubble key={m.id} message={m} isNew={isNew} />;
                })}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-background p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <button onClick={() => setComposerMode("reply")} className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "reply" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>Reply</button>
                <button onClick={() => setComposerMode("note")} className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "note" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}>Internal note</button>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={handleAiDraft} disabled={aiDrafting}>
                    {aiDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />} AI draft (simulated)
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => rewriteText(c))} disabled={!composer}>Rewrite</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => shortenText(c))} disabled={!composer}>Shorten</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => makeFriendlier(c))} disabled={!composer}>Friendlier</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setComposer((c) => makeMoreFormal(c))} disabled={!composer}>More formal</Button>
                </div>
              </div>
              <div className={`rounded-xl border ${composerMode === "note" ? "border-amber-300/50 bg-amber-50/30" : "border-border bg-background"}`}>
                <Textarea
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

      <AnimatePresence>
      {selectedConv && showContext && (
        <m.div
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 24, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }}
          className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-background scroll-thin lg:flex"
        >
          <ContextPanel contactId={selectedConv.contactId} />
        </m.div>
      )}
      </AnimatePresence>
    </div>
  );
}

function ConversationListItem({ conv, active, checked, onCheck, onClick }: { conv: Conversation; active: boolean; checked: boolean; onCheck: (c: boolean) => void; onClick: () => void }) {
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
              <AvatarFallback className="text-[10px]" style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }}>
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
              <span className="truncate text-[11px] text-muted-foreground">{conv.preview}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 pl-10">
          {conv.priority === "urgent" && <Badge variant="destructive" className="h-4 px-1 text-[9px]">Urgent</Badge>}
          {conv.unread > 0 && <span className="rounded-full bg-[oklch(0.62_0.16_42)] px-1.5 text-[9px] font-medium text-white">{conv.unread}</span>}
          {conv.slaBreached && <span className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA</span>}
          {conv.hasAppointment && <Calendar className="h-3 w-3 text-muted-foreground" />}
          {conv.hasLead && <span className="text-[9px] text-muted-foreground">lead</span>}
        </div>
      </button>
    </div>
  );
}

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

function ContextPanel({ contactId }: { contactId: string }) {
  const contact = demoContacts.getById(contactId);
  if (!contact) return null;

  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback style={{ backgroundColor: contact.avatarColor, color: "white" }} className="text-lg">
            {contact.initials}
          </AvatarFallback>
        </Avatar>
        <Link href={`/app/contacts/${contact.id}`} className="mt-3 font-serif text-lg hover:underline">{contact.name}</Link>
        {contact.company && <div className="text-xs text-muted-foreground">{contact.company.name}</div>}
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          <Badge variant="outline" className="text-[10px] capitalize">{contact.leadStage}</Badge>
          {contact.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
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

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI summary (simulated)</div>
          <p className="text-xs leading-relaxed text-foreground/80">{contact.aiSummary}</p>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</div>
          <p className="text-xs leading-relaxed text-foreground/70">{contact.notes}</p>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            <Link href="/app/calendar"><Button variant="outline" size="sm" className="h-7 text-[11px]"><Calendar className="h-3 w-3" /> Book</Button></Link>
            <Link href={`/app/contacts/${contact.id}`}><Button variant="outline" size="sm" className="h-7 text-[11px]"><FileText className="h-3 w-3" /> Profile</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
