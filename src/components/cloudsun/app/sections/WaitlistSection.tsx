"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoState } from "@/hooks/use-demo-state";
import { team, locations } from "@/data/demo";
import { appointmentTypes } from "@/config/cloudsun";
import type { ChannelId } from "@/config/cloudsun";
import { demoWaitlist } from "@/lib/repositories";
import type { OpenSlot, WaitlistEntry } from "@/data/demo";
import { timeAgo } from "../../shared/format";
import { toast } from "sonner";
import {
  ListOrdered,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CalendarX,
  Plus,
  Sparkles,
  XCircle,
  CalendarCheck,
  MapPin,
} from "lucide-react";

type RankedEntry = WaitlistEntry & { _score?: number };

const acceptanceColors: Record<string, string> = {
  waiting: "oklch(0.5 0 0)",
  invited: "oklch(0.70 0.12 75)",
  accepted: "oklch(0.45 0.08 155)",
  filled: "oklch(0.45 0.08 155)",
  declined: "oklch(0.62 0.16 42)",
};

const acceptanceLabel: Record<string, string> = {
  waiting: "Waiting",
  invited: "Invited",
  accepted: "Accepted",
  filled: "Filled",
  declined: "Declined",
};

const channelOptions: { value: ChannelId; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "webchat", label: "Website chat" },
];

const urgencyOptions = [
  { value: "Routine", label: "Routine" },
  { value: "Soon", label: "Soon" },
  { value: "Urgent", label: "Urgent" },
];

const availabilityOptions = [
  "Any",
  "Mornings",
  "Afternoons",
  "Evenings",
  "Weekdays",
  "Weekends",
];

export function WaitlistSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");

  // Add-to-waitlist dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [apptType, setApptType] = useState(appointmentTypes[1].name);
  const [preferredLocation, setPreferredLocation] = useState("Any");
  const [preferredProvider, setPreferredProvider] = useState("Any");
  const [availability, setAvailability] = useState("Any");
  const [channel, setChannel] = useState<ChannelId>("whatsapp");
  const [urgency, setUrgency] = useState("Routine");
  const [notes, setNotes] = useState("");

  // Open slot picker state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [ranked, setRanked] = useState<RankedEntry[] | null>(null);

  // Last filled appointment (for confirmation card)
  const [lastFilled, setLastFilled] = useState<{ appointmentId: string; patientName: string; slot: OpenSlot } | null>(null);

  const filtered = state.waitlist.filter((w) => filter === "all" || w.acceptanceState === filter);

  const stats = {
    total: state.waitlist.length,
    waiting: state.waitlist.filter((w) => w.acceptanceState === "waiting").length,
    invited: state.waitlist.filter((w) => w.acceptanceState === "invited").length,
    accepted: state.waitlist.filter((w) => w.acceptanceState === "accepted").length,
    filled: state.waitlist.filter((w) => w.acceptanceState === "filled").length,
  };

  const selectedSlot = useMemo(
    () => state.openSlots.find((s) => s.id === selectedSlotId) ?? null,
    [state.openSlots, selectedSlotId],
  );

  // Merge the ranked snapshot with live waitlist entries so that badges and
  // action buttons reflect the latest acceptanceState (e.g. after an invite
  // the entry should show "Invited" controls instead of "Invite").
  const liveRanked: RankedEntry[] | null = useMemo(() => {
    if (!ranked) return null;
    const scoreById = new Map(ranked.map((r) => [r.id, r._score ?? 0]));
    const reasonById = new Map(ranked.map((r) => [r.id, r.matchReason ?? ""]));
    return ranked
      .map((r) => state.waitlist.find((w) => w.id === r.id))
      .filter((w): w is WaitlistEntry => Boolean(w))
      .map((w) => ({
        ...w,
        _score: scoreById.get(w.id) ?? 0,
        matchReason: w.matchReason || reasonById.get(w.id) || "",
      }));
  }, [ranked, state.waitlist]);

  const openSlots = state.openSlots;

  function resetAddForm() {
    setPatientName("");
    setApptType(appointmentTypes[1].name);
    setPreferredLocation("Any");
    setPreferredProvider("Any");
    setAvailability("Any");
    setChannel("whatsapp");
    setUrgency("Routine");
    setNotes("");
  }

  function handleAddToWaitlist() {
    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    demoWaitlist.create({
      patientName: patientName.trim(),
      preferredLocation,
      preferredProvider,
      appointmentType: apptType,
      availability,
      contactPreference: channel,
      matchReason: `New entry · ${urgency.toLowerCase()}`,
    });
    toast.success("Added to waitlist", {
      description: `${patientName.trim()} is now ${urgency.toLowerCase() === "urgent" ? "an urgent" : "a"} candidate for ${apptType}${notes ? `.` : `.`}`,
    });
    resetAddForm();
    setAddOpen(false);
  }

  function handleSelectSlot(slot: OpenSlot) {
    if (slot.status !== "open") {
      toast.info("Slot no longer open", { description: "This slot was already filled or expired." });
      return;
    }
    setSelectedSlotId(slot.id);
    setRanked(null);
  }

  function handleRankCandidates() {
    if (!selectedSlot) {
      toast.error("Select an open slot first");
      return;
    }
    const candidates = demoWaitlist.rankCandidates(selectedSlot);
    setRanked(candidates as RankedEntry[]);
    toast.success(`${candidates.length} candidate${candidates.length === 1 ? "" : "s"} ranked`, {
      description: `Matched against ${selectedSlot.appointmentType} on ${selectedSlot.date} at ${selectedSlot.locationName}.`,
    });
  }

  function handleInvite(entry: WaitlistEntry) {
    if (!selectedSlot) return;
    demoWaitlist.invite(entry.id, selectedSlot.id);
    toast.success("Invitation sent (simulated)", {
      description: `${entry.patientName} invited to ${selectedSlot.appointmentType} on ${selectedSlot.date} at ${selectedSlot.time}.`,
    });
  }

  function handleSimulateAccept(entry: WaitlistEntry) {
    if (!selectedSlot) return;
    demoWaitlist.accept(entry.id, selectedSlot.id);
    toast.success("Invitation accepted (simulated)", {
      description: `${entry.patientName} accepted. Ready to fill the slot.`,
    });
  }

  function handleSimulateDecline(entry: WaitlistEntry) {
    if (!selectedSlot) return;
    demoWaitlist.decline(entry.id, selectedSlot.id);
    toast.info("Invitation declined (simulated)", {
      description: `${entry.patientName} declined. Other invitations continue.`,
    });
  }

  function handleFillSlot(entry: WaitlistEntry) {
    if (!selectedSlot) return;
    const appt = demoWaitlist.fillSlot(entry.id, selectedSlot);
    if (!appt) {
      toast.error("Could not fill slot", {
        description: "The entry must be accepted and the slot must still be open.",
      });
      return;
    }
    setLastFilled({ appointmentId: appt.id, patientName: entry.patientName, slot: selectedSlot });
    // Slot is now filled — clear selection so the workflow can restart.
    setSelectedSlotId(null);
    setRanked(null);
    toast.success("Slot filled from waitlist", {
      description: `Created ${appt.title} for ${appt.contactName}. Remaining invitations for this slot have been stopped.`,
      action: {
        label: "Open calendar",
        onClick: () => { window.location.href = "/app/calendar"; },
      },
    });
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Waitlist & Cancellation Recovery"
        subtitle="Fill cancelled slots with matching waitlist patients. All outreach is simulated."
        action={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add to waitlist
          </Button>
        }
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

      {/* Open slots */}
      <Card className="mb-6 border-border bg-card">
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarX className="h-3.5 w-3.5" /> Open cancellation slots ({openSlots.filter((s) => s.status === "open").length})
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRankCandidates}
              disabled={!selectedSlot}
              className="h-7 text-[11px]"
            >
              <Sparkles className="h-3 w-3" /> Rank candidates
            </Button>
          </div>
          {openSlots.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
              No open cancellation slots right now.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-3">
              {openSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isOpen = slot.status === "open";
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    disabled={!isOpen}
                    className={`flex flex-col items-start gap-1 rounded-lg border px-3 py-2.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "border-[oklch(0.62_0.16_42)] bg-[oklch(0.62_0.16_42)]/[0.06]"
                        : isOpen
                          ? "border-border bg-muted/20 hover:bg-muted/40"
                          : "border-border bg-muted/10 opacity-60"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">
                        {new Date(slot.date + "T" + slot.time).toLocaleString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}
                      </span>
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" />}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {slot.locationName}</span>
                      <span>·</span>
                      <span>{slot.providerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <Badge variant="outline" className="text-[9px]">{slot.appointmentType}</Badge>
                      <Badge
                        variant="outline"
                        className="text-[9px] capitalize"
                        style={{ color: slot.status === "open" ? "oklch(0.45 0.08 155)" : slot.status === "filled" ? "oklch(0.5 0 0)" : "oklch(0.62 0.16 42)" }}
                      >
                        {slot.status}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedSlot && (
            <div className="mt-3 text-[11px] text-muted-foreground">
              Selected: <span className="font-medium text-foreground">{selectedSlot.appointmentType}</span> on{" "}
              {new Date(selectedSlot.date + "T" + selectedSlot.time).toLocaleString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })} · {selectedSlot.locationName} · {selectedSlot.providerName}.
              {" "}Click <span className="font-medium text-foreground">Rank candidates</span> to score the waitlist.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ranked candidates */}
      {liveRanked && (
        <Card className="mb-6 border-[oklch(0.45_0.08_155)]/20 bg-[oklch(0.45_0.08_155)]/[0.03]">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.45_0.08_155)]">
              <Sparkles className="h-3.5 w-3.5" /> Ranked candidates
            </div>
            {liveRanked.length === 0 ? (
              <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                No eligible candidates. Patients without recorded consent or on the do-not-contact list are excluded.
              </div>
            ) : (
              <div className="space-y-2">
                {liveRanked.map((entry, idx) => {
                  const isInvited = entry.acceptanceState === "invited";
                  const isAccepted = entry.acceptanceState === "accepted";
                  const isFilled = entry.acceptanceState === "filled";
                  const isDeclined = entry.acceptanceState === "declined";
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-md border border-border bg-background/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[oklch(0.45_0.08_155)]/10 text-[11px] font-semibold text-[oklch(0.45_0.08_155)]">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{entry.patientName}</span>
                            <Badge variant="outline" className="text-[9px]">{entry._score ?? 0} pts</Badge>
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {entry.preferredLocation} · {entry.preferredProvider} · {entry.appointmentType}
                          </div>
                          <div className="text-[10px] text-[oklch(0.45_0.08_155)]">Match: {entry.matchReason || "—"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.acceptanceState === "waiting" && (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleInvite(entry)}>
                            <Send className="h-3 w-3" /> Invite
                          </Button>
                        )}
                        {isInvited && (
                          <>
                            <Badge variant="outline" className="text-[9px]" style={{ color: acceptanceColors.invited }}>
                              <Clock className="h-2.5 w-2.5" /> Awaiting response
                            </Badge>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] text-[oklch(0.45_0.08_155)]" onClick={() => handleSimulateAccept(entry)}>
                              <CheckCircle2 className="h-3 w-3" /> Simulate accept
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 text-[11px] text-[oklch(0.62_0.16_42)]" onClick={() => handleSimulateDecline(entry)}>
                              <XCircle className="h-3 w-3" /> Simulate decline
                            </Button>
                          </>
                        )}
                        {isAccepted && (
                          <>
                            <Badge variant="outline" className="text-[9px]" style={{ color: acceptanceColors.accepted }}>
                              <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
                            </Badge>
                            <Button size="sm" className="h-7 text-[11px] bg-[oklch(0.45_0.08_155)] text-white hover:bg-[oklch(0.45_0.08_155)]/90" onClick={() => handleFillSlot(entry)}>
                              <CalendarCheck className="h-3 w-3" /> Fill slot
                            </Button>
                          </>
                        )}
                        {isFilled && (
                          <Badge variant="outline" className="text-[9px]" style={{ color: acceptanceColors.filled }}>
                            <CheckCircle2 className="h-2.5 w-2.5" /> Filled
                          </Badge>
                        )}
                        {isDeclined && (
                          <Badge variant="outline" className="text-[9px]" style={{ color: acceptanceColors.declined }}>
                            <XCircle className="h-2.5 w-2.5" /> Declined
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground">
              Ranking is not clinically validated. Scores are deterministic and shown only for demo transparency.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Last filled appointment confirmation */}
      {lastFilled && (
        <Card className="mb-6 border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/[0.05]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.45_0.08_155)]">
                  <CalendarCheck className="h-3.5 w-3.5" /> Slot filled
                </div>
                <div className="mt-1 text-sm font-medium">
                  {lastFilled.patientName} → {lastFilled.slot.appointmentType}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {new Date(lastFilled.slot.date + "T" + lastFilled.slot.time).toLocaleString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })} · {lastFilled.slot.locationName} · {lastFilled.slot.providerName}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Appointment ID: <span className="font-mono">{lastFilled.appointmentId}</span>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                <Link href="/app/calendar"><CalendarCheck className="h-3.5 w-3.5" /> Open calendar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-1">
        {["all", "waiting", "invited", "accepted", "filled", "declined"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-2.5 py-1 text-xs capitalize ${filter === f ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            {f === "all" ? "All" : acceptanceLabel[f] ?? f}
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
                        className="text-[9px]"
                        style={{ color: acceptanceColors[w.acceptanceState] }}
                      >
                        {acceptanceLabel[w.acceptanceState] ?? w.acceptanceState}
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
                    {w.acceptanceState === "invited" && selectedSlot && w.openSlotId === selectedSlot.id && (
                      <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 text-[11px] text-[oklch(0.45_0.08_155)]" onClick={() => handleSimulateAccept(w)}>
                          <CheckCircle2 className="h-3 w-3" /> Simulate accept
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] text-[oklch(0.62_0.16_42)]" onClick={() => handleSimulateDecline(w)}>
                          <XCircle className="h-3 w-3" /> Simulate decline
                        </Button>
                      </div>
                    )}
                    {w.acceptanceState === "accepted" && selectedSlot && w.openSlotId === selectedSlot.id && (
                      <div className="mt-2">
                        <Button size="sm" className="h-7 text-[11px] bg-[oklch(0.45_0.08_155)] text-white hover:bg-[oklch(0.45_0.08_155)]/90" onClick={() => handleFillSlot(w)}>
                          <CalendarCheck className="h-3 w-3" /> Fill slot
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {w.acceptanceState === "waiting" && (
                      <Badge variant="outline" className="gap-1 text-[10px]" style={{ color: acceptanceColors.waiting }}>
                        <Clock className="h-2.5 w-2.5" /> Waiting
                      </Badge>
                    )}
                    {w.acceptanceState === "invited" && (
                      <Badge variant="outline" className="gap-1 text-[10px]" style={{ color: acceptanceColors.invited }}>
                        <Send className="h-2.5 w-2.5" /> Invited
                      </Badge>
                    )}
                    {w.acceptanceState === "accepted" && (
                      <Badge variant="outline" className="gap-1 text-[10px]" style={{ color: acceptanceColors.accepted }}>
                        <CheckCircle2 className="h-2.5 w-2.5" /> Accepted
                      </Badge>
                    )}
                    {w.acceptanceState === "filled" && (
                      <Badge variant="outline" className="gap-1 text-[10px]" style={{ color: acceptanceColors.filled }}>
                        <CheckCircle2 className="h-2.5 w-2.5" /> Filled
                      </Badge>
                    )}
                    {w.acceptanceState === "declined" && (
                      <Badge variant="outline" className="gap-1 text-[10px]" style={{ color: acceptanceColors.declined }}>
                        <XCircle className="h-2.5 w-2.5" /> Declined
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No waitlist entries in this filter.</div>
            )}
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

      {/* Add to waitlist dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to waitlist</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="wl-name" className="text-xs">Patient name</Label>
              <Input
                id="wl-name"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="h-9 text-sm"
                placeholder="e.g. Rohan Gupta"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Appointment type</Label>
                <Select value={apptType} onValueChange={setApptType}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Preferred location</Label>
                <Select value={preferredLocation} onValueChange={setPreferredLocation}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    {locations.map((l) => (
                      <SelectItem key={l.id} value={l.name.split(" — ")[1] ?? l.name}>{l.name.split(" — ")[1] ?? l.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Preferred provider</Label>
                <Select value={preferredProvider} onValueChange={setPreferredProvider}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Any">Any</SelectItem>
                    {team.filter((m) => m.department === "Clinical").map((m) => (
                      <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Contact channel</Label>
                <Select value={channel} onValueChange={(v) => setChannel(v as ChannelId)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {channelOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Availability</Label>
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Urgency</Label>
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {urgencyOptions.map((u) => (
                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="wl-notes" className="text-xs">Notes</Label>
              <Textarea
                id="wl-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-12 text-xs"
                placeholder="Optional context for the front desk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddToWaitlist}>
              <Plus className="h-3.5 w-3.5" /> Add to waitlist
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionScroll>
  );
}
