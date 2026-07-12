"use client";

import { useMemo, useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDemoState } from "@/hooks/use-demo-state";
import { team } from "@/data/demo";
import { appointmentTypes } from "@/config/cloudsun";
import type { ChannelId } from "@/config/cloudsun";
import {
  demoRecall,
  demoAppointments,
  demoAudit,
} from "@/lib/repositories";
import { timeAgo } from "../../shared/format";
import { toast } from "sonner";
import {
  Search,
  RotateCw,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  UserCog,
  Pause,
  MessageSquareReply,
  CalendarPlus,
  XCircle,
  Ban,
  Archive,
} from "lucide-react";

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

const channelOptions: { value: ChannelId; label: string }[] = [
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "webchat", label: "Website chat" },
];

interface RecallSequenceDraft {
  id: string;
  name: string;
  targetGroup: string;
  channel: ChannelId;
  delays: string;
  approvalRequired: boolean;
  enabled: boolean;
}

export function RecallSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Dialog state
  const [sequenceOpen, setSequenceOpen] = useState(false);
  const [sequences, setSequences] = useState<RecallSequenceDraft[]>([]);

  // Sequence form fields
  const [seqName, setSeqName] = useState("6-month hygiene recall");
  const [seqTarget, setSeqTarget] = useState("All due and overdue patients");
  const [seqChannel, setSeqChannel] = useState<ChannelId>("whatsapp");
  const [seqDelays, setSeqDelays] = useState("Day 0, Day 3, Day 7, Day 10");
  const [seqApproval, setSeqApproval] = useState(true);
  const [seqEnabled, setSeqEnabled] = useState(true);

  // Booked appointment form state
  const [bookOpen, setBookOpen] = useState(false);
  const [bookRecallId, setBookRecallId] = useState<string | null>(null);
  const [bookPatient, setBookPatient] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookType, setBookType] = useState(appointmentTypes[3].id);
  const [bookNote, setBookNote] = useState("");

  const filtered = state.recallCases.filter((rc) => {
    if (filter !== "all" && rc.status !== filter) return false;
    if (search && !rc.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedRecall = useMemo(
    () => state.recallCases.find((r) => r.id === bookRecallId) ?? null,
    [state.recallCases, bookRecallId],
  );

  function handleSendReminder(id: string, patientName: string) {
    const result = demoRecall.sendReminder(id);
    if (result.success) {
      toast.success("Reminder sent (simulated)", {
        description: `${patientName}: reminder sent via the approved sequence. No real patient was contacted.`,
      });
    } else {
      toast.error("Reminder blocked", {
        description: `${patientName}: ${result.reason}`,
      });
    }
  }

  function handleBulkSend() {
    if (selected.size === 0) return;
    const result = demoRecall.sendBulkReminder(Array.from(selected));
    if (result.sent > 0) {
      toast.success(`${result.sent} reminder${result.sent === 1 ? "" : "s"} sent (simulated)`, {
        description: result.skipped > 0
          ? `${result.skipped} skipped. ${result.reasons[0] ?? ""}`
          : "All selected patients were contacted via the approved sequence.",
      });
    } else if (result.skipped > 0) {
      toast.error("All reminders blocked", {
        description: result.reasons[0] ?? "No reminders could be sent.",
      });
    }
    setSelected(new Set());
  }

  function handleSaveSequence() {
    if (!seqName.trim()) {
      toast.error("Sequence name is required");
      return;
    }
    const draft: RecallSequenceDraft = {
      id: `seq_${Date.now()}`,
      name: seqName.trim(),
      targetGroup: seqTarget.trim() || "All recall patients",
      channel: seqChannel,
      delays: seqDelays.trim() || "Day 0, Day 7",
      approvalRequired: seqApproval,
      enabled: seqEnabled,
    };
    setSequences((prev) => [draft, ...prev]);
    demoAudit.add({
      id: `al_${Date.now()}`,
      actor: "System",
      actorType: "system",
      action: "Created recall sequence (draft)",
      resource: `RecallSequence ${draft.id}`,
      at: new Date().toISOString(),
      ip: "internal",
      result: "success",
      details: `${draft.name} → ${draft.targetGroup} via ${draft.channel}. Approvals required: ${draft.approvalRequired ? "yes" : "no"}.`,
    });
    toast.success("Recall sequence created", {
      description: `${draft.name} saved as a draft. Outreach will follow the ${draft.delays} schedule once approved.`,
    });
    setSequenceOpen(false);
  }

  function openBookDialog(recallId: string) {
    const rc = state.recallCases.find((r) => r.id === recallId);
    setBookRecallId(recallId);
    setBookPatient(rc?.patientName ?? "");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookDate(tomorrow.toISOString().split("T")[0]);
    setBookTime("10:00");
    setBookType(appointmentTypes[3].id);
    setBookNote("");
    setBookOpen(true);
  }

  function handleConfirmBooking() {
    if (!bookRecallId || !selectedRecall) return;
    if (!bookDate || !bookTime) {
      toast.error("Date and time are required");
      return;
    }
    const type = appointmentTypes.find((t) => t.id === bookType) ?? appointmentTypes[3];
    const start = new Date(`${bookDate}T${bookTime}`);
    const end = new Date(start.getTime() + type.duration * 60000);
    const conflict = demoAppointments.checkConflict({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });
    if (conflict) {
      toast.error("Scheduling conflict", {
        description: `Overlaps with "${conflict.title}" for ${conflict.contactName}.`,
      });
      return;
    }
    const appt = demoAppointments.create({
      contactId: selectedRecall.patientId,
      contactName: selectedRecall.patientName,
      title: type.name,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      status: "confirmed",
      source: "phone",
      channel: "phone",
      type: type.name,
      appointmentTypeId: type.id,
      bookingSource: "recall",
      bookingMode: "human",
      confirmationStatus: "confirmed",
      internalNote: bookNote.trim() || undefined,
    });
    demoRecall.markBooked(selectedRecall.id, appt.id);
    toast.success("Recall booked", {
      description: `${selectedRecall.patientName}: ${type.name} on ${start.toLocaleString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}.`,
    });
    setBookOpen(false);
    setBookRecallId(null);
  }

  function handleAssign(id: string, assigneeId: string) {
    const member = team.find((t) => t.id === assigneeId);
    demoRecall.assign(id, assigneeId);
    toast.success("Recall assigned", {
      description: member ? `Now owned by ${member.name}.` : "Assignee updated.",
    });
  }

  function handlePause(id: string) {
    demoRecall.pause(id);
    toast.info("Recall paused", { description: "Sequence halted. Resume from the actions menu." });
  }
  function handleResponded(id: string) {
    demoRecall.markResponded(id);
    toast.success("Marked as responded", { description: "Offer an appointment to close the loop." });
  }
  function handleDecline(id: string) {
    demoRecall.decline(id);
    toast.info("Marked as declined");
  }
  function handleDoNotContact(id: string) {
    demoRecall.markDoNotContact(id);
    toast.warning("Marked do-not-contact", {
      description: "No further automated outreach will be sent.",
    });
  }
  function handleClose(id: string) {
    demoRecall.close(id);
    toast.success("Recall closed");
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Recall"
        subtitle="Bring due and overdue patients back with approved reminder sequences. All actions are simulated."
        action={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <Button variant="outline" size="sm" onClick={handleBulkSend}>
                <Send className="h-3.5 w-3.5" /> Send to {selected.size}
              </Button>
            )}
            <Button size="sm" onClick={() => setSequenceOpen(true)}>
              <RotateCw className="h-3.5 w-3.5" /> New recall sequence
            </Button>
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
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => handleSendReminder(rc.id, rc.patientName)}
                      disabled={rc.status === "do_not_contact" || rc.status === "booked"}
                    >
                      <Send className="h-3 w-3" /> Send reminder
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Recall actions">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Stage actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() => openBookDialog(rc.id)}
                        >
                          <CalendarPlus className="h-3.5 w-3.5" /> Mark booked…
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleResponded(rc.id)}>
                          <MessageSquareReply className="h-3.5 w-3.5" /> Mark responded
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handlePause(rc.id)}>
                          <Pause className="h-3.5 w-3.5" /> Pause
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleClose(rc.id)}>
                          <Archive className="h-3.5 w-3.5" /> Close
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDecline(rc.id)}>
                          <XCircle className="h-3.5 w-3.5" /> Decline
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDoNotContact(rc.id)}>
                          <Ban className="h-3.5 w-3.5" /> Do not contact
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          Reassign
                        </DropdownMenuLabel>
                        {team.filter((m) => m.role !== "read_only").map((m) => (
                          <DropdownMenuItem
                            key={m.id}
                            onSelect={() => handleAssign(rc.id, m.id)}
                            disabled={rc.assigneeId === m.id}
                          >
                            <UserCog className="h-3.5 w-3.5" /> {m.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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

            {sequences.length > 0 && (
              <div className="mt-4 space-y-1.5">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Saved sequences (demo)</div>
                {sequences.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        {s.targetGroup} · {s.channel} · {s.delays}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.approvalRequired && (
                        <Badge variant="outline" className="text-[9px] text-[oklch(0.62_0.16_42)]">
                          Approval required
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[9px]"
                        style={{ color: s.enabled ? "oklch(0.45 0.08 155)" : "oklch(0.5 0 0)" }}
                      >
                        {s.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="mt-3 text-[11px] text-muted-foreground">All outreach is simulated. No real patients are contacted. Approvals required before sending.</p>
          </CardContent>
        </Card>
      </div>

      {/* New recall sequence dialog */}
      <Dialog open={sequenceOpen} onOpenChange={setSequenceOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New recall sequence</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="seq-name" className="text-xs">Sequence name</Label>
              <Input
                id="seq-name"
                value={seqName}
                onChange={(e) => setSeqName(e.target.value)}
                className="h-9 text-sm"
                placeholder="e.g. 6-month hygiene recall"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seq-target" className="text-xs">Target group</Label>
              <Input
                id="seq-target"
                value={seqTarget}
                onChange={(e) => setSeqTarget(e.target.value)}
                className="h-9 text-sm"
                placeholder="e.g. All patients due in 30 days"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Primary channel</Label>
              <Select value={seqChannel} onValueChange={(v) => setSeqChannel(v as ChannelId)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="seq-delays" className="text-xs">Delay schedule</Label>
              <Input
                id="seq-delays"
                value={seqDelays}
                onChange={(e) => setSeqDelays(e.target.value)}
                className="h-9 text-sm"
                placeholder="e.g. Day 0, Day 3, Day 7"
              />
              <p className="text-[10px] text-muted-foreground">Comma-separated delays between messages.</p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
              <div>
                <div className="text-xs font-medium">Approval required</div>
                <div className="text-[10px] text-muted-foreground">A staff member must approve before each send.</div>
              </div>
              <Switch checked={seqApproval} onCheckedChange={setSeqApproval} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
              <div>
                <div className="text-xs font-medium">Enabled</div>
                <div className="text-[10px] text-muted-foreground">Drafts stay paused until enabled.</div>
              </div>
              <Switch checked={seqEnabled} onCheckedChange={setSeqEnabled} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSequenceOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSequence}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Save sequence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book appointment dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book recall appointment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="book-patient" className="text-xs">Patient</Label>
              <Input id="book-patient" value={bookPatient} readOnly className="h-9 text-sm bg-muted/30" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="book-date" className="text-xs">Date</Label>
                <Input
                  id="book-date"
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="book-time" className="text-xs">Time</Label>
                <Input
                  id="book-time"
                  type="time"
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Appointment type</Label>
              <Select value={bookType} onValueChange={setBookType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} · {t.duration}m</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Internal note (optional)"
              className="min-h-12 text-xs"
              value={bookNote}
              onChange={(e) => setBookNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBooking}>
              <CalendarPlus className="h-3.5 w-3.5" /> Confirm booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionScroll>
  );
}
