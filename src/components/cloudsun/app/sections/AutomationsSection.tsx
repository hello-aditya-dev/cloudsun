"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { automations } from "@/data/demo";
import { timeAgo } from "../../shared/format";
import type { Automation } from "@/types/domain";
import {
  Plus, Workflow, Zap, Clock, GitBranch, Bot, CheckCircle2,
  AlertTriangle, Play, History, ArrowRight, X, ChevronDown,
} from "lucide-react";

const stepIcons: Record<string, typeof Zap> = {
  trigger: Zap,
  condition: GitBranch,
  ai: Bot,
  action: CheckCircle2,
  delay: Clock,
  branch: GitBranch,
  approval: AlertTriangle,
  test: Play,
};

export function AutomationsSection() {
  const [selected, setSelected] = useState<Automation | null>(null);

  return (
    <SectionScroll>
      <PageHeader
        title="Automations"
        subtitle="Trigger → condition → AI step → action. Clear, editable flows that actually run."
        action={<Button size="sm"><Plus className="h-3.5 w-3.5" /> New automation</Button>}
      />

      <div className="grid gap-3">
        {automations.map((a) => (
          <Card key={a.id} className="border-border bg-card transition-all hover:shadow-soft">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{a.name}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] capitalize"
                      style={{
                        color: a.status === "enabled" ? "oklch(0.45 0.08 155)" : a.status === "draft" ? "oklch(0.5 0 0)" : "oklch(0.70 0.12 75)",
                      }}
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Zap className="h-3 w-3" /> {a.trigger}</span>
                    <span>·</span>
                    <span>{a.runs} runs</span>
                    <span>·</span>
                    <span>last {timeAgo(a.lastRun)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked={a.status === "enabled"} />
                  <Button variant="outline" size="sm" onClick={() => setSelected(a)} className="text-[11px]">
                    Edit
                  </Button>
                </div>
              </div>

              {/* Flow steps */}
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
                {a.steps.map((s, i) => {
                  const Icon = stepIcons[s.kind] ?? Zap;
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/20 px-2 py-1 text-[10px]">
                        <Icon className="h-3 w-3 text-muted-foreground" />
                        {s.label}
                      </div>
                      {i < a.steps.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity history */}
      <Card className="mt-6 border-border bg-card">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Recent activity
          </div>
          <div className="space-y-2">
            {[
              { name: "Booking confirmation — email + WhatsApp", at: "2m ago", status: "success", detail: "ap_3 · Arjun Malhotra" },
              { name: "Missed-call WhatsApp follow-up", at: "9h ago", status: "success", detail: "call_7 · Daniel Okafor" },
              { name: "Qualify new WhatsApp leads", at: "2h ago", status: "success", detail: "Fatima Al-Sayed" },
              { name: "Negative sentiment → manager", at: "8m ago", status: "warning", detail: "Saanvi Patel — assigned to Leila" },
              { name: "Low AI confidence → approval", at: "46m ago", status: "success", detail: "Elena Petrova draft awaiting approval" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-2.5 text-xs">
                {r.status === "success" ? <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.45_0.08_155)]" /> : <AlertTriangle className="h-3.5 w-3.5 text-[oklch(0.70_0.12_75)]" />}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground">{r.detail}</div>
                </div>
                <span className="text-[10px] text-muted-foreground">{r.at}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <Card className="relative z-10 h-full w-full max-w-md overflow-y-auto rounded-l-2xl rounded-r-none border-border bg-card shadow-lift">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif text-lg">{selected.name}</div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{selected.description}</p>
                </div>
                <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Flow</div>
                {selected.steps.map((s, i) => {
                  const Icon = stepIcons[s.kind] ?? Zap;
                  return (
                    <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-card text-muted-foreground">
                          <Icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 text-xs font-medium capitalize">{s.kind}</div>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <div className="mt-1.5 pl-8 text-xs text-foreground/80">{s.label}</div>
                    </div>
                  );
                })}
                <Button variant="outline" size="sm" className="w-full"><Plus className="h-3 w-3" /> Add step</Button>
              </div>

              <div className="mt-5 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5"><Play className="h-3 w-3" /> Test</Button>
                <Button size="sm" className="flex-1">Save changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SectionScroll>
  );
}
