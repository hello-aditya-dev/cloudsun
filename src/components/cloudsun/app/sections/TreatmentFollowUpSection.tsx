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
import { demoTreatmentFollowUp } from "@/lib/repositories";
import { timeAgo } from "../../shared/format";
import { formatPrice } from "@/config/cloudsun";
import { Search, ClipboardList, Send, Phone, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";

const stages = [
  { id: "all", label: "All" },
  { id: "follow_up_due", label: "Follow-up due" },
  { id: "first_message", label: "First message sent" },
  { id: "patient_responded", label: "Patient responded" },
  { id: "question_pending", label: "Question pending" },
  { id: "coordinator_required", label: "Coordinator required" },
  { id: "appointment_booked", label: "Appointment booked" },
  { id: "not_ready", label: "Not ready" },
  { id: "declined", label: "Declined" },
  { id: "closed", label: "Closed" },
];

const stageColors: Record<string, string> = {
  follow_up_due: "oklch(0.70 0.12 75)",
  first_message: "oklch(0.65 0.05 250)",
  patient_responded: "oklch(0.45 0.08 155)",
  question_pending: "oklch(0.70 0.12 75)",
  coordinator_required: "oklch(0.62 0.16 42)",
  appointment_booked: "oklch(0.45 0.08 155)",
  not_ready: "oklch(0.5 0 0)",
  declined: "oklch(0.5 0 0)",
  closed: "oklch(0.5 0 0)",
};

const stageLabel: Record<string, string> = {
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

export function TreatmentFollowUpSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = state.treatmentFollowUps.filter((tf) => {
    if (filter !== "all" && tf.stage !== filter) return false;
    if (search && !tf.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalEstimatedValue = filtered.reduce((sum, tf) => sum + tf.estimatedValue, 0);

  return (
    <SectionScroll>
      <PageHeader
        title="Treatment Follow-up"
        subtitle="Follow up on unfinished treatment plans without pressuring patients. All communication is simulated."
        action={<Button size="sm"><ClipboardList className="h-3.5 w-3.5" /> New follow-up</Button>}
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total follow-ups", value: state.treatmentFollowUps.length.toString(), icon: ClipboardList },
          { label: "Pending response", value: state.treatmentFollowUps.filter((t) => t.stage === "first_message" || t.stage === "follow_up_due").length.toString(), icon: Send },
          { label: "Coordinator needed", value: state.treatmentFollowUps.filter((t) => t.stage === "coordinator_required").length.toString(), icon: Phone },
          { label: "Estimated value", value: formatPrice(totalEstimatedValue), icon: DollarSign },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-serif text-xl">{s.value}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-1">
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`rounded-md px-2.5 py-1 text-xs ${filter === s.id ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Pipeline */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search treatment follow-ups…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((tf) => {
              const member = team.find((t) => t.id === tf.assigneeId);
              return (
                <div key={tf.id} className="p-4 hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-[10px]" style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }}>
                        {tf.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tf.patientName}</span>
                        <Badge
                          variant="outline"
                          className="text-[9px]"
                          style={{ color: stageColors[tf.stage] }}
                        >
                          {stageLabel[tf.stage] ?? tf.stage}
                        </Badge>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        <div>Treatment: <span className="text-foreground/80">{tf.treatmentType}</span></div>
                        <div>Est. value: <span className="font-medium text-foreground">{formatPrice(tf.estimatedValue)}</span></div>
                        <div>Last contact: <span className="text-foreground/80">{tf.lastContact ? timeAgo(tf.lastContact) : "Never"}</span></div>
                        <div>Next action: <span className="text-foreground/80">{tf.nextAction}</span></div>
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
                      {tf.stage === "coordinator_required" && (
                        <Button variant="outline" size="sm" className="h-7 text-[11px]">
                          <Phone className="h-3 w-3" /> Call
                        </Button>
                      )}
                      {(tf.stage === "follow_up_due" || tf.stage === "first_message") && (
                        <Button variant="outline" size="sm" className="h-7 text-[11px]">
                          <Send className="h-3 w-3" /> Send follow-up
                        </Button>
                      )}
                      {tf.stage === "appointment_booked" && (
                        <Badge variant="outline" className="gap-1 text-[10px] text-[oklch(0.45_0.08_155)]">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Booked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Guardrails */}
      <Card className="mt-6 border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.03]">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.62_0.16_42)]">
            <AlertTriangle className="h-3.5 w-3.5" /> Guardrails
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 text-xs text-foreground/80">
            {[
              "Does not diagnose",
              "Does not promise treatment outcomes",
              "Does not pressure patients",
              "Does not invent prices",
              "Uses only practice-approved information",
              "Escalates clinical questions",
              "Respects communication consent",
              "Respects do-not-contact status",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.45_0.08_155)]" />
                {rule}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </SectionScroll>
  );
}
