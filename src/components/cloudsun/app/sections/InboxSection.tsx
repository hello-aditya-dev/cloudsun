"use client";

import { useState, useMemo } from "react";
import { SectionScroll } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { conversations, messagesByConversation, contacts, team } from "@/data/demo";
import { channels, channelList, type ChannelId } from "@/config/cloudsun";
import { ChannelIcon, ChannelBadge } from "../../shared/Channel";
import { timeAgo, timeOnly, formatDateTime } from "../../shared/format";
import type { Conversation, Message } from "@/types/domain";
import {
  Search, Filter, Inbox as InboxIcon, Star, Clock, Bot, UserCheck,
  CheckCircle2, Moon, Archive, Ban as SpamIcon, Paperclip, Sparkles, Send,
  Smile, ChevronDown, PanelRightClose, PanelRight, AlertTriangle,
  Mail, MessageCircle, MessageSquare, Phone, Calendar, FileText,
  RefreshCw, Wand2, Loader2, X,
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

export function InboxSection() {
  const [filter, setFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState<ChannelId | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>(conversations[0].id);
  const [composer, setComposer] = useState("");
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [showContext, setShowContext] = useState(true);
  const [aiDrafting, setAiDrafting] = useState(false);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (channelFilter !== "all" && c.channel !== channelFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.contactName.toLowerCase().includes(q) && !c.preview.toLowerCase().includes(q) && !c.subject.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filter, channelFilter, search]);

  const selected = conversations.find((c) => c.id === selectedId) ?? filtered[0];
  const messages = (selected && messagesByConversation[selected.id]) ?? defaultThread(selected);
  const contact = selected && contacts.find((c) => c.id === selected.contactId);
  const assignee = selected && team.find((t) => t.id === selected.assigneeId);

  function handleAiDraft() {
    setAiDrafting(true);
    setTimeout(() => {
      setComposer("Hi " + (selected?.contactName.split(" ")[0] ?? "there") + ",\n\nThanks for reaching out. I'd be happy to help with this. Let me check what we have available and get back to you within the hour.\n\nBest,\nAtelier North");
      setAiDrafting(false);
    }, 900);
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
            const count = f.id === "all" ? conversations.length : conversations.filter((c) => c.status === f.id).length;
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
          <button
            onClick={() => setChannelFilter("all")}
            className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${channelFilter === "all" ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}
          >
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            All channels
          </button>
          {channelList.map((c) => (
            <button
              key={c.id}
              onClick={() => setChannelFilter(c.id)}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${channelFilter === c.id ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:bg-sidebar-accent/50"}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </button>
          ))}

          <div className="mb-1 mt-4 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Filters</div>
          {["Priority", "Assignee", "Intent", "Sentiment", "AI confidence", "SLA status", "Tags"].map((f) => (
            <button key={f} className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent/50">
              <span className="flex items-center gap-2"><Filter className="h-3 w-3" />{f}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Middle panel — conversation list */}
      <div className="flex w-72 shrink-0 flex-col border-r border-border bg-background md:w-80">
        <div className="flex items-center justify-between border-b border-border p-3">
          <div className="text-sm font-medium">
            {filtered.length} conversation{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Filter className="h-3.5 w-3.5" /></Button>
          </div>
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
                active={selected?.id === c.id}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Main panel — conversation */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {selected ? (
          <>
            {/* Conversation header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback style={{ backgroundColor: contact?.avatarColor ?? "oklch(0.5 0 0)", color: "white" }} className="text-xs">
                    {contact?.initials ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{selected.contactName}</span>
                    <ChannelBadge id={selected.channel} withLabel />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    {selected.company && <span className="truncate">{selected.company}</span>}
                    {selected.aiHandling && <span className="inline-flex items-center gap-1"><Bot className="h-3 w-3" /> AI handling</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selected.priority === "urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
                {selected.slaBreached && <Badge variant="outline" className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA breached</Badge>}
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowContext((v) => !v)}>
                  {showContext ? <PanelRightClose className="h-4 w-4" /> : <PanelRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto bg-muted/20 scroll-thin">
              <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
                <div className="flex items-center justify-center">
                  <span className="rounded-full bg-background px-3 py-1 text-[10px] text-muted-foreground shadow-soft">
                    {formatDateTime(messages[0]?.createdAt ?? selected.lastAt)}
                  </span>
                </div>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="shrink-0 border-t border-border bg-background p-3">
              <div className="mb-2 flex items-center gap-1.5">
                <button
                  onClick={() => setComposerMode("reply")}
                  className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "reply" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  Reply
                </button>
                <button
                  onClick={() => setComposerMode("note")}
                  className={`rounded-md px-2.5 py-1 text-xs ${composerMode === "note" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  Internal note
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]" onClick={handleAiDraft} disabled={aiDrafting}>
                    {aiDrafting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                    AI draft
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
                    <Sparkles className="h-3 w-3" /> Rewrite
                  </Button>
                </div>
              </div>
              <div className={`rounded-xl border ${composerMode === "note" ? "border-amber-300/50 bg-amber-50/30" : "border-border bg-background"}`}>
                <Textarea
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  placeholder={composerMode === "note" ? "Write a note for your team…" : "Write a reply…"}
                  className="min-h-[80px] resize-none border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                />
                <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Paperclip className="h-3.5 w-3.5" /></button>
                    <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"><Smile className="h-3.5 w-3.5" /></button>
                    <button className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:bg-muted">
                      <Mail className="h-3 w-3" /> {channels[selected.channel].short}
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]">Schedule</Button>
                    <Button variant="ghost" size="sm" className="h-7 text-[11px]">Request approval</Button>
                    <Button size="sm" className="h-7 gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Send className="h-3 w-3" />
                      {composerMode === "note" ? "Add note" : "Send"}
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

      {/* Right context panel */}
      {selected && showContext && (
        <div className="hidden w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-background scroll-thin lg:flex">
          <ContextPanel contactId={selected.contactId} assigneeId={selected.assigneeId} />
        </div>
      )}
    </div>
  );
}

function ConversationListItem({ conv, active, onClick }: { conv: Conversation; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full flex-col gap-1.5 border-b border-border/60 px-3 py-3 text-left transition-colors ${active ? "bg-muted/60" : "hover:bg-muted/30"}`}
    >
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
  );
}

function MessageBubble({ message }: { message: Message }) {
  if (message.kind === "handoff" || message.author === "system") {
    return (
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground shadow-soft">
          <AlertTriangle className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />
          {message.body}
        </div>
      </div>
    );
  }
  if (message.kind === "note" || message.author === "human" && message.channel === "internal") {
    return (
      <div className="flex justify-center">
        <div className="max-w-md rounded-lg border border-amber-300/40 bg-amber-50/40 px-3 py-2 text-xs">
          <div className="mb-0.5 font-medium text-amber-900">{message.authorName}</div>
          <div className="text-amber-900/80">{message.body}</div>
        </div>
      </div>
    );
  }
  const isCustomer = message.author === "customer";
  const isAi = message.author === "ai";
  return (
    <div className={`flex ${isCustomer ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[75%] ${isCustomer ? "" : "text-right"}`}>
        <div className={`mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground ${isCustomer ? "" : "justify-end"}`}>
          {isAi && <Bot className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />}
          <span>{message.authorName}</span>
          <span>·</span>
          <span>{timeOnly(message.createdAt)}</span>
        </div>
        <div
          className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
            isCustomer
              ? "rounded-tl-md bg-card text-foreground shadow-soft"
              : isAi
                ? "rounded-tr-md bg-[oklch(0.62_0.16_42)]/10 text-foreground ring-1 ring-[oklch(0.62_0.16_42)]/20"
                : "rounded-tr-md bg-primary text-primary-foreground"
          }`}
        >
          {message.body}
        </div>
        {isAi && message.aiConfidence !== undefined && (
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
            <Sparkles className="h-2.5 w-2.5" /> AI confidence {Math.round(message.aiConfidence * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}

function ContextPanel({ contactId, assigneeId }: { contactId: string; assigneeId?: string }) {
  const contact = contacts.find((c) => c.id === contactId);
  const assignee = team.find((t) => t.id === assigneeId);
  if (!contact) return null;

  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback style={{ backgroundColor: contact.avatarColor, color: "white" }} className="text-lg">
            {contact.initials}
          </AvatarFallback>
        </Avatar>
        <div className="mt-3 font-serif text-lg">{contact.name}</div>
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
            <div key={id.handle} className="flex items-center gap-2 py-1 text-xs">
              <ChannelIcon id={id.channel} className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 truncate">{id.handle}</span>
              {id.verified && <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />}
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Assignee</div>
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback style={{ backgroundColor: assignee.avatarColor, color: "white" }} className="text-[9px]">
                  {assignee.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{assignee.name}</span>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Unassigned</div>
          )}
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">AI summary</div>
          <p className="text-xs leading-relaxed text-foreground/80">{contact.aiSummary}</p>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Suggested next action</div>
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 text-xs">
            Send a personal apology and offer a free reschedule for Saanvi. Assign Leila directly.
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</div>
          <p className="text-xs leading-relaxed text-foreground/70">{contact.notes}</p>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Quick actions</div>
          <div className="grid grid-cols-2 gap-1.5">
            <Button variant="outline" size="sm" className="h-7 text-[11px]"><Calendar className="h-3 w-3" /> Book</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]"><UserCheck className="h-3 w-3" /> Assign</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]"><FileText className="h-3 w-3" /> Profile</Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]"><Moon className="h-3 w-3" /> Snooze</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function defaultThread(conv?: Conversation): Message[] {
  if (!conv) return [];
  return [
    { id: "d1", conversationId: conv.id, author: "customer", channel: conv.channel, authorName: conv.contactName, body: conv.preview, createdAt: conv.lastAt, status: "read" },
  ];
}
