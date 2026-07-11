"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDemoState } from "@/hooks/use-demo-state";
import { timeAgo } from "../../shared/format";
import { ListOrdered, Send, CheckCircle2, Clock, AlertTriangle, CalendarX } from "lucide-react";

const acceptanceColors: Record<string, string> = {
  waiting: "oklch(0.5 0 0)",
  invited: "oklch(0.70 0.12 75)",
  accepted: "oklch(0.45 0.08 155)",
  declined: "oklch(0.62 0.16 42)",
};

export function WaitlistSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");

  const filtered = state.waitlist.filter((w) => filter === "all" || w.acceptanceState === filter);

  const stats = {
    total: state.waitlist.length,
    waiting: state.waitlist.filter((w) => w.acceptanceState === "waiting").length,
    invited: state.waitlist.filter((w) => w.acceptanceState === "invited").length,
    accepted: state.waitlist.filter((w) => w.acceptanceState === "accepted").length,
  };

  return (
    <SectionScroll>
      <PageHeader
        title="Waitlist & Cancellation Recovery"
        subtitle="Fill cancelled slots with matching waitlist patients. All outreach is simulated."
        action={<Button size="sm"><ListOrdered className="h-3.5 w-3.5" /> Add to waitlist</Button>}
      />

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total waitlist", value: stats.total, icon: ListOrdered },
          { label: "Waiting", value: stats.waiting, icon: Clock },
          { label: "Invited", value: stats.invited, icon: Send },
          { label: "Accepted", value: stats.accepted, icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-serif text-2xl">{s.value}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-1">
        {["all", "waiting", "invited", "accepted", "declined"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1 text-xs capitalize ${filter === f ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>

      {/* List */}
      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((w) => (
              <div key={w.id} className="p-4 hover:bg-muted/30">
                <div className="flex items-start gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-[10px]" style={{ backgroundColor: "oklch(0.62 0.16 42)", color: "white" }}>
                      {w.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{w.patientName}</span>
                      <Badge
                        variant="outline"
                        className="text-[9px] capitalize"
                        style={{ color: acceptanceColors[w.acceptanceState] }}
                      >
                        {w.acceptanceState}
                      </Badge>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      <div>Location: <span className="text-foreground/80">{w.preferredLocation}</span></div>
                      <div>Provider: <span className="text-foreground/80">{w.preferredProvider}</span></div>
                      <div>Type: <span className="text-foreground/80">{w.appointmentType}</span></div>
                      <div>Availability: <span className="text-foreground/80">{w.availability}</span></div>
                      <div>Channel: <span className="text-foreground/80 capitalize">{w.contactPreference}</span></div>
                      <div>Last outreach: <span className="text-foreground/80">{w.lastOutreach ? timeAgo(w.lastOutreach) : "Never"}</span></div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 rounded-md border border-[oklch(0.45_0.08_155)]/20 bg-[oklch(0.45_0.08_155)]/[0.03] px-2.5 py-1.5 text-[11px]">
                      <AlertTriangle className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />
                      <span className="text-muted-foreground">Match reason:</span>
                      <span className="font-medium text-foreground/80">{w.matchReason}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {w.acceptanceState === "waiting" && (
                      <Button variant="outline" size="sm" className="h-7 text-[11px]">
                        <Send className="h-3 w-3" /> Invite
                      </Button>
                    )}
                    {w.acceptanceState === "invited" && (
                      <Badge variant="outline" className="gap-1 text-[10px]">
                        <Clock className="h-2.5 w-2.5" /> Awaiting response
                      </Badge>
                    )}
                    {w.acceptanceState === "accepted" && (
                      <Badge variant="outline" className="gap-1 text-[10px] text-[oklch(0.45_0.08_155)]">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Filled
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow explanation */}
      <Card className="mt-6 border-border bg-card">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <CalendarX className="h-3.5 w-3.5" /> Cancellation recovery workflow
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {[
              "Cancellation occurs",
              "Matching patients ranked",
              "Staff reviews candidates",
              "Simulated invitation sent",
              "Patient accepts",
              "Slot filled",
              "Remaining invitations stop",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="rounded-md border border-border bg-muted/20 px-2.5 py-1.5">{step}</div>
                {i < 6 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Ranking is not clinically validated. All invitations are simulated. Audit log updates automatically.</p>
        </CardContent>
      </Card>
    </SectionScroll>
  );
}
