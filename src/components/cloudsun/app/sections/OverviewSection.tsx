"use client";

import Link from "next/link";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analytics, appointments, conversations, team, auditLog } from "@/data/demo";
import { channelList, type ChannelId } from "@/config/cloudsun";
import { ChannelIcon } from "../../shared/Channel";
import { timeAgo, formatDay, timeOnly } from "../../shared/format";
import {
  ArrowUpRight, ArrowDownRight, Inbox, Clock, Sparkles, PhoneCall,
  CalendarCheck, Users, AlertTriangle, TrendingUp, Activity,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const kpis = [
  { label: "Open conversations", value: "12", delta: "+3", trend: "up", icon: Inbox, sub: "3 waiting for human" },
  { label: "AI-resolved (14d)", value: "287", delta: "+12%", trend: "up", icon: Sparkles, sub: "84% AI-handled rate" },
  { label: "Appointments booked", value: "56", delta: "+8", trend: "up", icon: CalendarCheck, sub: "last 14 days" },
  { label: "Missed calls recovered", value: "14", delta: "+5", trend: "up", icon: PhoneCall, sub: "via WhatsApp" },
];

export function OverviewSection() {
  const urgent = conversations.filter((c) => c.priority === "urgent" || c.slaBreached).slice(0, 4);
  const upcoming = appointments.filter((a) => new Date(a.startAt) >= new Date("2026-07-11T13:30:00+05:30")).slice(0, 4);
  const online = team.filter((t) => t.availability !== "offline");

  return (
    <SectionScroll>
      <PageHeader
        title="Overview"
        subtitle="What needs attention, what the AI handled, and what your team should do next."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Last 14 days</Button>
            <Link href="/app/inbox"><Button size="sm">Open inbox</Button></Link>
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`inline-flex items-center gap-0.5 text-xs ${k.trend === "up" ? "text-[oklch(0.45_0.08_155)]" : "text-[oklch(0.62_0.16_42)]"}`}>
                    {k.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {k.delta}
                  </span>
                </div>
                <div className="mt-4 font-serif text-3xl tracking-tight">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground/80">{k.sub}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Conversation volume chart */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Conversation volume · 14 days</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-serif text-2xl">488</span>
                  <span className="inline-flex items-center gap-0.5 text-xs text-[oklch(0.45_0.08_155)]">
                    <TrendingUp className="h-3 w-3" /> 18% vs prior
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.62_0.16_42)]/10 px-2 py-1 text-[oklch(0.62_0.16_42)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.16_42)]" /> AI
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Human
                </span>
              </div>
            </div>
            <div className="mt-5 flex h-44 items-end gap-1.5">
              {analytics.conversationVolume.map((h, i) => {
                const ai = Math.round(h * (analytics.aiHandledRate[i] / 100));
                const human = h - ai;
                return (
                  <div key={i} className="group flex flex-1 flex-col gap-0.5">
                    <div className="rounded-t bg-[oklch(0.62_0.16_42)] transition-all group-hover:opacity-80" style={{ height: `${ai * 2.6}px` }} />
                    <div className="rounded-b bg-muted-foreground/30" style={{ height: `${human * 2.6}px` }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Jun 28</span><span>Jul 4</span><span>Jul 11</span>
            </div>
          </CardContent>
        </Card>

        {/* Channel volume */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Channel volume</div>
            <div className="mt-4 space-y-3">
              {analytics.overview.channelVolume.map((c) => {
                const max = Math.max(...analytics.overview.channelVolume.map((v) => v.count));
                const pct = (c.count / max) * 100;
                const ch = channelList.find((cl) => cl.id === c.channel)!;
                return (
                  <div key={c.channel}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ChannelIcon id={c.channel as ChannelId} className="h-3.5 w-3.5" style={{ color: ch.color }} />
                        {c.label}
                      </div>
                      <span className="font-medium">{c.count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: ch.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <div className="text-xs text-muted-foreground">AI confidence trend</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-2xl">0.87</span>
                <span className="text-xs text-[oklch(0.45_0.08_155)]">+0.04</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Urgent conversations */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                <span className="text-sm font-medium">Needs attention</span>
              </div>
              <Link href="/app/inbox"><Button variant="ghost" size="sm">View all</Button></Link>
            </div>
            <div className="space-y-2">
              {urgent.map((c) => (
                <Link
                  key={c.id}
                  href={`/app/inbox/${c.id}`}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-background p-3 text-left hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium">
                    {c.contactName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{c.contactName}</span>
                      <ChannelIcon id={c.channel} className="h-3 w-3 text-muted-foreground" />
                      {c.priority === "urgent" && <Badge variant="destructive" className="text-[9px]">Urgent</Badge>}
                      {c.slaBreached && <Badge variant="outline" className="text-[9px] text-[oklch(0.62_0.16_42)]">SLA breached</Badge>}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.preview}</div>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{timeAgo(c.lastAt)}</div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming appointments */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-[oklch(0.45_0.08_155)]" />
                <span className="text-sm font-medium">Upcoming</span>
              </div>
              <Link href="/app/calendar"><Button variant="ghost" size="sm">Calendar</Button></Link>
            </div>
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div key={a.id} className="flex gap-3">
                  <div className="flex w-12 flex-col items-center rounded-lg border border-border bg-muted/30 py-1.5">
                    <div className="text-[10px] uppercase text-muted-foreground">{formatDay(a.startAt).slice(0, 3)}</div>
                    <div className="font-serif text-lg leading-none">{new Date(a.startAt).getDate()}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.contactName}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{timeOnly(a.startAt)} · {a.type}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Team availability */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Team availability</span>
              </div>
              <Link href="/app/team"><Button variant="ghost" size="sm">Team</Button></Link>
            </div>
            <div className="space-y-2.5">
              {online.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback style={{ backgroundColor: m.avatarColor, color: "white" }} className="text-[10px]">
                      {m.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.role.replace("_", " ")} · {m.capacity.current}/{m.capacity.max} active</div>
                  </div>
                  <span className={`h-2 w-2 rounded-full ${m.availability === "available" ? "bg-[oklch(0.45_0.08_155)]" : m.availability === "busy" ? "bg-[oklch(0.62_0.16_42)]" : "bg-[oklch(0.70_0.12_75)]"}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent AI actions */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                <span className="text-sm font-medium">Recent AI actions</span>
              </div>
              <Link href="/app/audit-log"><Button variant="ghost" size="sm">Audit log</Button></Link>
            </div>
            <div className="space-y-2">
              {auditLog.filter((a) => a.actorType === "ai").slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${a.result === "success" ? "bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]" : "bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]"}`}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{a.action}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(a.at)}</span>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{a.resource} · {a.details}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Demonstration data — not a real customer outcome. Connect live integrations in Settings.
      </p>
    </SectionScroll>
  );
}
