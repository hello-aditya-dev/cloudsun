"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { analytics } from "@/data/demo";
import { channelList } from "@/config/cloudsun";
import {
  TrendingUp, TrendingDown, Clock, Phone, Bot, Users, IndianRupee,
  Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

interface DonutSegment {
  name: string;
  color: string;
  dash: number;
  offset: number;
}

function computeDonutSegments(slices: { name: string; value: number; color: string }[]): DonutSegment[] {
  let acc = 0;
  return slices.map((s) => {
    const dash = (s.value / 100) * 251.2;
    const seg: DonutSegment = { name: s.name, color: s.color, dash, offset: acc };
    acc += dash;
    return seg;
  });
}

export function AnalyticsSection() {
  const [range, setRange] = useState("14d");
  const [compare, setCompare] = useState(true);

  return (
    <SectionScroll>
      <PageHeader
        title="Analytics"
        subtitle="Numbers that explain the front desk — not decorate it."
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              {["7d", "14d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-md px-2.5 py-1 text-xs ${range === r ? "bg-muted font-medium" : "text-muted-foreground"}`}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCompare((c) => !c)} className={compare ? "bg-muted" : ""}>
              Compare
            </Button>
          </div>
        }
      />

      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Conversations", value: "488", delta: "+18%", trend: "up", sub: "vs 412 prior" },
          { label: "First response", value: "1.4m", delta: "-33%", trend: "up", sub: "vs 2.1m prior" },
          { label: "Resolution time", value: "8.2m", delta: "-12%", trend: "up", sub: "median" },
          { label: "Reopened", value: "4.1%", delta: "-1.2pts", trend: "up", sub: "improving" },
        ].map((k) => (
          <Card key={k.label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-serif text-3xl">{k.value}</span>
                <span className={`inline-flex items-center gap-0.5 text-xs ${k.trend === "up" ? "text-[oklch(0.45_0.08_155)]" : "text-[oklch(0.62_0.16_42)]"}`}>
                  {k.trend === "up" ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                  {k.delta}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{k.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversation volume + Channel mix */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-medium">Conversation volume & AI-handled rate</div>
              <div className="flex gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-[oklch(0.62_0.16_42)]"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.16_42)]" /> AI</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" /> Human</span>
              </div>
            </div>
            <div className="flex h-56 items-end gap-1.5">
              {analytics.conversationVolume.map((h, i) => {
                const ai = Math.round(h * (analytics.aiHandledRate[i] / 100));
                const human = h - ai;
                return (
                  <div key={i} className="group flex flex-1 flex-col gap-0.5">
                    <div className="rounded-t bg-[oklch(0.62_0.16_42)] transition-opacity group-hover:opacity-80" style={{ height: `${ai * 3}px` }} />
                    <div className="rounded-b bg-muted-foreground/25" style={{ height: `${human * 3}px` }} />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Jun 28</span><span>Jul 4</span><span>Jul 11</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-4 text-sm font-medium">Channel mix</div>
            {/* Donut */}
            <div className="relative mx-auto h-40 w-40">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                {computeDonutSegments(analytics.channelMix).map((seg) => (
                  <circle
                    key={seg.name}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="12"
                    strokeDasharray={`${seg.dash} 251.2`}
                    strokeDashoffset={-seg.offset}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="font-serif text-2xl">488</div>
                <div className="text-[10px] text-muted-foreground">conversations</div>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              {analytics.channelMix.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </div>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI performance */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium"><Bot className="h-4 w-4 text-[oklch(0.62_0.16_42)]" /> AI performance</div>
            <div className="mt-4 space-y-3">
              {[
                { label: "AI-handled rate", value: "84%", trend: "+6pts" },
                { label: "Autonomous resolution", value: "71%", trend: "+4pts" },
                { label: "Human takeover rate", value: "16%", trend: "-3pts" },
                { label: "Avg confidence", value: "0.87", trend: "+0.04" },
                { label: "Incorrect-answer reports", value: "2.1%", trend: "-0.5pts" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-xs last:border-0">
                  <span className="text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.value}</span>
                    <span className="text-[10px] text-[oklch(0.45_0.08_155)]">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium"><IndianRupee className="h-4 w-4 text-[oklch(0.45_0.08_155)]" /> Revenue & leads</div>
            <div className="mt-4 space-y-3">
              {[
                { label: "New leads", value: "23", trend: "+5" },
                { label: "Qualified leads", value: "14", trend: "+3" },
                { label: "Appointments booked", value: "56", trend: "+8" },
                { label: "Appointment conversion", value: "42%", trend: "+2pts" },
                { label: "Revenue influenced", value: "$204K", trend: "+18%" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-xs last:border-0">
                  <span className="text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.value}</span>
                    <span className="text-[10px] text-[oklch(0.45_0.08_155)]">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-muted-foreground" /> Team</div>
            <div className="mt-4 space-y-3">
              {[
                { label: "Workload (avg)", value: "3.2 active", trend: "-0.4" },
                { label: "Response time", value: "1.8m", trend: "-0.3m" },
                { label: "Resolution time", value: "12.4m", trend: "-1.1m" },
                { label: "Quality review", value: "94%", trend: "+1pt" },
                { label: "Conversations owned", value: "76", trend: "+9" },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between border-b border-border/60 pb-2 text-xs last:border-0">
                  <span className="text-muted-foreground">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{m.value}</span>
                    <span className="text-[10px] text-[oklch(0.45_0.08_155)]">{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly + Cost */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="mb-4 text-sm font-medium">Hourly volume · 8am – 8pm</div>
            <div className="flex h-40 items-end gap-2">
              {analytics.hourlyVolume.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-[oklch(0.62_0.16_42)]/70" style={{ height: `${h * 4}px` }} />
                  <div className="text-[9px] text-muted-foreground">{8 + i}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-[11px] text-muted-foreground">Peak: 11am–12pm. Staff accordingly.</div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-sm font-medium">Cost breakdown</div>
            <div className="space-y-2 text-xs">
              {analytics.monthlyCost.map((c) => (
                <div key={c.category}>
                  <div className="flex justify-between"><span className="text-muted-foreground">{c.category}</span><span>${c.amount}</span></div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[oklch(0.62_0.16_42)]" style={{ width: `${(c.amount / 1240) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Cost / conversation</span><span className="font-medium">${analytics.costPerConversation}</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Cost / appointment</span><span className="font-medium">${analytics.costPerAppointment}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-center text-[11px] text-muted-foreground">
        Demonstration data — not real customer outcomes. No misleading chart scales used.
      </p>
    </SectionScroll>
  );
}
