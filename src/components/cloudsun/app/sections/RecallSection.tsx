"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDemoState } from "@/hooks/use-demo-state";
import { team } from "@/data/demo";
import { timeAgo } from "../../shared/format";
import { Search, RotateCw, Send, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const statusGroups = [
  { id: "all", label: "All", color: "oklch(0.5 0 0)" },
  { id: "due_now", label: "Due now", color: "oklch(0.70 0.12 75)" },
  { id: "due_30", label: "Due in 30 days", color: "oklch(0.65 0.05 250)" },
  { id: "overdue_30", label: "Overdue 30+", color: "oklch(0.62 0.16 42)" },
  { id: "overdue_60", label: "Overdue 60+", color: "oklch(0.62 0.16 42)" },
  { id: "overdue_90", label: "Overdue 90+", color: "oklch(0.58 0.2 27)" },
  { id: "contacted", label: "Contacted", color: "oklch(0.45 0.08 155)" },
  { id: "responded", label: "Responded", color: "oklch(0.45 0.08 155)" },
  { id: "booked", label: "Booked", color: "oklch(0.45 0.08 155)" },
  { id: "declined", label: "Declined", color: "oklch(0.5 0 0)" },
  { id: "do_not_contact", label: "Do not contact", color: "oklch(0.5 0 0)" },
];

const statusLabel: Record<string, string> = {
  due_now: "Due now",
  due_30: "Due in 30 days",
  overdue_30: "Overdue 30+ days",
  overdue_60: "Overdue 60+ days",
  overdue_90: "Overdue 90+ days",
  contacted: "Contacted",
  responded: "Responded",
  booked: "Booked",
  declined: "Declined",
  do_not_contact: "Do not contact",
};

export function RecallSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = state.recallCases.filter((rc) => {
    if (filter !== "all" && rc.status !== filter) return false;
    if (search && !rc.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function bulkAction(action: string) {
    // Simulated — would update recall cases via repository
    setSelected(new Set());
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Recall"
        subtitle="Bring due and overdue patients back with approved reminder sequences. All actions are simulated."
        action={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button variant="outline" size="sm" onClick={() => bulkAction("send")}>
                <Send className="h-3.5 w-3.5" /> Send to {selected.size}
              </Button>
            )}
            <Button size="sm"><RotateCw className="h-3.5 w-3.5" /> New recall sequence</Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {statusGroups.map((g) => {
          const count = g.id === "all" ? state.recallCases.length : state.recallCases.filter((r) => r.status === g.id).length;
          return (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              className={`rounded-md px-2.5 py-1 text-xs ${filter === g.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              {g.label} {count > 0 && <span className="text-[10px] opacity-60">({count})</span>}
            </button>
          );
        })}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recall patients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((rc) => {
              const member = team.find((t) => t.id === rc.assigneeId);
              return (
                <div key={rc.id} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                  <input
                    type="checkbox"
                    checked={selected.has(rc.id)}
                    onChange={(e) => {
                      const next = new Set(selected);
                      if (e.target.checked) next.add(rc.id); else next.delete(rc.id);
                      setSelected(next);
                    }}
                    className="h-4 w-4 accent-[oklch(0.62_0.16_42)]"
                  />
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-[10px]" style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }}>
                      {rc.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{rc.patientName}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px]"
                        style={{ color: statusGroups.find((g) => g.id === rc.status)?.color }}
                      >
                        {statusLabel[rc.status] ?? rc.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Recall due: {timeAgo(rc.recallDue)} · Last contact: {rc.lastContact ? timeAgo(rc.lastContact) : "Never"} · Channel: {rc.channel}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="text-muted-foreground">Next action:</span>
                      <span className="font-medium">{rc.nextAction}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member && (
                      <Avatar className="h-6 w-6" title={member.name}>
                        <AvatarFallback style={{ backgroundColor: member.avatarColor, color: "white" }} className="text-[8px]">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <Button variant="outline" size="sm" className="h-7 text-[11px]">Send reminder</Button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No recall cases in this filter.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recall sequence builder</div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { label: "Initial reminder", icon: Send },
                { label: "Follow-up (3 days)", icon: Clock },
                { label: "Alternative channel (7 days)", icon: RotateCw },
                { label: "Human call task (10 days)", icon: AlertTriangle },
                { label: "Close / pause", icon: CheckCircle2 },
              ].map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      {step.label}
                    </div>
                    {i < 4 && <span className="text-muted-foreground">→</span>}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">All outreach is simulated. No real patients are contacted. Approvals required before sending.</p>
          </CardContent>
        </Card>
      </div>
    </SectionScroll>
  );
}
