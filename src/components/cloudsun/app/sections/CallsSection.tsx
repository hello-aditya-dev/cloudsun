"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { calls, contacts } from "@/data/demo";
import { ChannelIcon } from "../../shared/Channel";
import { formatDuration, timeAgo, formatDateTime } from "../../shared/format";
import type { Call } from "@/types/domain";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Voicemail,
  Play, Pause, Mic, MicOff, PhoneOff, UserPlus, Hand, Repeat,
  Sparkles, AlertTriangle, CheckCircle2, Volume2, Bot, FileText,
  ChevronRight, List, X,
} from "lucide-react";

const callFilters = [
  { id: "all", label: "All calls" },
  { id: "incoming", label: "Incoming" },
  { id: "outgoing", label: "Outgoing" },
  { id: "missed", label: "Missed" },
  { id: "voicemail", label: "Voicemail" },
  { id: "ai", label: "AI handled" },
  { id: "human", label: "Human handled" },
];

export function CallsSection() {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string>(calls[0].id);
  const [view, setView] = useState<"list" | "live">("list");

  const filtered = calls.filter((c) => {
    if (filter === "all") return true;
    if (filter === "ai") return c.handler === "ai";
    if (filter === "human") return c.handler === "human";
    return c.direction === filter;
  });

  const selected = calls.find((c) => c.id === selectedId) ?? filtered[0];

  return (
    <SectionScroll>
      <PageHeader
        title="Calls"
        subtitle="Simulated calls, transcripts and after-call summaries."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setView("list")} className={view === "list" ? "bg-muted" : ""}>
              <List className="h-3.5 w-3.5" /> List
            </Button>
            <Button size="sm" onClick={() => setView("live")} className={view === "live" ? "bg-primary" : ""}>
              <span className="relative mr-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.62_0.16_42)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[oklch(0.62_0.16_42)]" />
              </span>
              Simulated call
            </Button>
          </div>
        }
      />

      {view === "live" ? (
        <LiveCallWorkspace call={calls.find((c) => c.status === "live") ?? calls[0]} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-1">
            <Card className="border-border bg-card">
              <CardContent className="p-0">
                <div className="flex flex-wrap gap-1 border-b border-border p-2">
                  {callFilters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`rounded-md px-2 py-1 text-[11px] ${filter === f.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="divide-y divide-border">
                  {filtered.map((c) => (
                    <CallRow key={c.id} call={c} active={selected?.id === c.id} onClick={() => setSelectedId(c.id)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected && <CallDetail call={selected} />}
          </div>
        </div>
      )}
    </SectionScroll>
  );
}

function CallRow({ call, active, onClick }: { call: Call; active: boolean; onClick: () => void }) {
  const Icon = call.direction === "incoming" ? PhoneIncoming : call.direction === "outgoing" ? PhoneOutgoing : call.direction === "missed" ? PhoneMissed : Voicemail;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${active ? "bg-muted/60" : "hover:bg-muted/30"}`}
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${call.direction === "missed" ? "bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]" : "bg-muted text-muted-foreground"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium">{call.contactName}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(call.startedAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {call.handler === "ai" ? <Bot className="h-3 w-3 text-[oklch(0.62_0.16_42)]" /> : <UserPlus className="h-3 w-3" />}
          <span className="capitalize">{call.direction}</span>
          <span>·</span>
          <span>{formatDuration(call.durationSec)}</span>
          {call.outcome && <><span>·</span><span className="truncate">{call.outcome}</span></>}
        </div>
      </div>
    </button>
  );
}

function CallDetail({ call }: { call: Call }) {
  const [playing, setPlaying] = useState(false);
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm" style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }}>
                {call.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-serif text-lg">{call.contactName}</div>
              <div className="text-xs text-muted-foreground">{call.phone}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={call.status === "live" ? "default" : call.status === "missed" ? "destructive" : "outline"} className="text-[10px] capitalize">
              {call.status}
            </Badge>
            {call.handler === "ai" && <Badge variant="outline" className="text-[10px] gap-1"><Bot className="h-3 w-3" /> AI</Badge>}
          </div>
        </div>

        {/* Meta */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Direction", value: call.direction },
            { label: "Duration", value: formatDuration(call.durationSec) },
            { label: "Sentiment", value: call.sentiment },
            { label: "Started", value: formatDateTime(call.startedAt) },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-border bg-muted/20 p-2.5">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</div>
              <div className="mt-0.5 text-sm font-medium capitalize">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Recording player */}
        {call.hasRecording && (
          <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPlaying((p) => !p)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <div className="flex-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-1/3 rounded-full bg-primary" />
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>1:24</span>
                  <span>{formatDuration(call.durationSec)}</span>
                </div>
              </div>
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />
              Recording consent given · retained per workspace policy
            </div>
          </div>
        )}

        {/* AI summary */}
        {call.aiSummary && (
          <div className="mt-5 rounded-xl border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" /> AI summary
            </div>
            <p className="text-sm leading-relaxed text-foreground/80">{call.aiSummary}</p>
          </div>
        )}

        {/* Transcript */}
        <div className="mt-5">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transcript</div>
          {call.transcript.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
              No transcript available for this call.
            </div>
          ) : (
            <div className="space-y-3">
              {call.transcript.map((t) => (
                <div key={t.id} className={`flex ${t.speaker === "ai" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${t.speaker === "ai" ? "rounded-tl-md bg-muted" : "rounded-tr-md bg-primary text-primary-foreground"}`}>
                    <div className="mb-0.5 text-[10px] opacity-70">{t.speaker === "ai" ? "Sunny (AI)" : call.contactName.split(" ")[0]}</div>
                    {t.text}
                    {t.confidence !== undefined && (
                      <div className="mt-1 text-[9px] opacity-60">confidence {Math.round(t.confidence * 100)}%</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topics & follow-ups */}
        {(call.topics?.length || call.followUps?.length) && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {call.topics && call.topics.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Topics</div>
                <div className="flex flex-wrap gap-1.5">
                  {call.topics.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            )}
            {call.followUps && call.followUps.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Follow-ups</div>
                <ul className="space-y-1.5">
                  {call.followUps.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.45_0.08_155)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Quality flags */}
        {call.qualityFlags && call.qualityFlags.length > 0 && (
          <div className="mt-5 rounded-lg border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-[oklch(0.62_0.16_42)]">
              <AlertTriangle className="h-3.5 w-3.5" /> Quality flags
            </div>
            <ul className="mt-1.5 space-y-1">
              {call.qualityFlags.map((f) => (
                <li key={f} className="text-xs text-foreground/80">· {f}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LiveCallWorkspace({ call }: { call: Call }) {
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const transcript = call.transcript;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden border-border bg-card">
          <div className="border-b border-border bg-muted/40 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.62_0.16_42)] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[oklch(0.62_0.16_42)]" />
                </span>
                <span className="text-sm font-medium">Live · {formatDuration(call.durationSec)}</span>
              </div>
              <Badge variant="outline" className="text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" /> Recording · consent given
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Caller */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }} className="text-sm">
                    {call.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-serif text-lg">{call.contactName}</div>
                  <div className="text-xs text-muted-foreground">{call.phone}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Intent</div>
                <div className="text-sm font-medium">Reschedule complaint</div>
                <div className="mt-1 text-[10px] text-[oklch(0.62_0.16_42)]">Sentiment: negative ↓</div>
              </div>
            </div>

            {/* Waveform */}
            <div className="mt-6 flex h-20 items-center justify-center gap-1 rounded-xl border border-border bg-muted/20 p-4">
              {Array.from({ length: 56 }).map((_, i) => {
                const h = 10 + Math.abs(Math.sin(i * 0.4 + call.durationSec * 0.05)) * 70;
                const isAi = i % 3 === 0;
                return (
                  <span
                    key={i}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${h}%`,
                      backgroundColor: isAi ? "oklch(0.62 0.16 42)" : "oklch(0.24 0.012 50)",
                      opacity: isAi ? 0.8 : 0.3,
                      animation: `cs-wave 1.1s ease-in-out ${i * 0.03}s infinite`,
                    }}
                  />
                );
              })}
            </div>

            {/* AI status */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Listening</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-xs font-medium text-[oklch(0.45_0.08_155)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[oklch(0.45_0.08_155)]" /> Active
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Confidence</div>
                <div className="mt-1 text-xs font-medium text-[oklch(0.62_0.16_42)]">0.58 ↓</div>
              </div>
              <div className="rounded-lg border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/5 p-2.5 text-center">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Status</div>
                <div className="mt-1 text-xs font-medium text-[oklch(0.62_0.16_42)]">Handoff requested</div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={() => setMuted((m) => !m)}>
                {muted ? <MicOff className="h-4 w-4 text-[oklch(0.62_0.16_42)]" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" onClick={() => setOnHold((h) => !h)}>
                <Hand className={`h-4 w-4 ${onHold ? "text-[oklch(0.70_0.12_75)]" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" className="h-11 gap-2">
                <Repeat className="h-4 w-4" /> Transfer
              </Button>
              <Button variant="outline" size="sm" className="h-11 gap-2">
                <UserPlus className="h-4 w-4" /> Add human
              </Button>
              <Button variant="destructive" size="sm" className="h-11 gap-2 rounded-full px-6">
                <PhoneOff className="h-4 w-4" /> End
              </Button>
            </div>
            {onHold && (
              <div className="mt-3 text-center text-xs text-[oklch(0.70_0.12_75)]">Call on hold — music playing for caller</div>
            )}
          </CardContent>
        </Card>

        {/* Transcript */}
        <Card className="mt-4 border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Live transcript</div>
            <div className="max-h-64 space-y-3 overflow-y-auto scroll-thin">
              {transcript.map((t) => (
                <div key={t.id} className={`flex ${t.speaker === "ai" ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${t.speaker === "ai" ? "rounded-tl-md bg-muted" : "rounded-tr-md bg-primary text-primary-foreground"}`}>
                    <div className="mb-0.5 text-[10px] opacity-70">{t.speaker === "ai" ? "Sunny (AI)" : call.contactName.split(" ")[0]}</div>
                    {t.text}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex gap-0.5">
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1 w-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </span>
                AI composing response…
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Side */}
      <div className="space-y-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer record</div>
            <div className="text-sm font-medium">{call.contactName}</div>
            <div className="text-xs text-muted-foreground">Patel Dental · existing customer</div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Lifetime visits</span><span>14</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last visit</span><span>Jun 28</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Sentiment trend</span><span className="text-[oklch(0.62_0.16_42)]">declining</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tool activity</div>
            <div className="space-y-2 text-xs">
              {[
                { t: "Retrieved calendar", s: "done" },
                { t: "Detected negative sentiment", s: "done" },
                { t: "Threshold breached (0.42 < 0.70)", s: "warning" },
                { t: "Requested human handoff", s: "pending" },
              ].map((a) => (
                <div key={a.t} className="flex items-center gap-2">
                  {a.s === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.45_0.08_155)]" /> : a.s === "warning" ? <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.70_0.12_75)]" /> : <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />}
                  <span className={a.s === "pending" ? "text-muted-foreground" : ""}>{a.t}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.04]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[oklch(0.62_0.16_42)]">
              <AlertTriangle className="h-4 w-4" /> Suggested action
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/80">
              Confidence below threshold and negative sentiment. Bring in Leila Fernandes — she owns this client.
            </p>
            <Button size="sm" className="mt-3 h-8 w-full bg-primary text-primary-foreground">
              Take over from AI
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
