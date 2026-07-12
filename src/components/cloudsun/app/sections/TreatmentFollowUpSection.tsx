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
import { appointmentTypes, formatPrice } from "@/config/cloudsun";
import { demoTreatmentFollowUp, demoAudit } from "@/lib/repositories";
import { timeAgo } from "../../shared/format";
import { toast } from "sonner";
import {
  Search,
  ClipboardList,
  Send,
  Phone,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Plus,
  MoreHorizontal,
  MessageSquareReply,
  HelpCircle,
  UserCog,
  Pause,
  XCircle,
  Archive,
  CalendarPlus,
  CalendarCheck,
} from "lucide-react";

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

const treatmentTypeOptions = [
  "Consultation",
  "Crown",
  "Root canal",
  "Implant",
  "Veneers",
  "Whitening",
  "Invisalign",
  "Cosmetic",
  "Emergency examination",
];

const coordinators = team.filter((m) => m.department === "Treatment coordination" || m.skills.includes("Treatment coordinator"));

export function TreatmentFollowUpSection() {
  const state = useDemoState();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // New follow-up dialog state
  const [newOpen, setNewOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [treatmentType, setTreatmentType] = useState(treatmentTypeOptions[0]);
  const [estimatedValue, setEstimatedValue] = useState("");
  const [coordinatorId, setCoordinatorId] = useState(coordinators[0]?.id ?? "u_leila");
  const [followUpDate, setFollowUpDate] = useState("");
  const [approvedMessage, setApprovedMessage] = useState("");
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [nextAction, setNextAction] = useState("Send first follow-up");

  // Book appointment dialog state
  const [bookOpen, setBookOpen] = useState(false);
  const [bookTfId, setBookTfId] = useState<string | null>(null);
  const [bookPatient, setBookPatient] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookType, setBookType] = useState(appointmentTypes[3].id);

  // Last booked appointment confirmation
  const [lastBooked, setLastBooked] = useState<{ appointmentId: string; patientName: string; treatmentType: string } | null>(null);

  const filtered = state.treatmentFollowUps.filter((tf) => {
    if (filter !== "all" && tf.stage !== filter) return false;
    if (search && !tf.patientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalEstimatedValue = filtered.reduce((sum, tf) => sum + tf.estimatedValue, 0);

  const selectedTf = useMemo(
    () => state.treatmentFollowUps.find((t) => t.id === bookTfId) ?? null,
    [state.treatmentFollowUps, bookTfId],
  );

  function resetNewForm() {
    setPatientName("");
    setTreatmentType(treatmentTypeOptions[0]);
    setEstimatedValue("");
    setCoordinatorId(coordinators[0]?.id ?? "u_leila");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFollowUpDate(tomorrow.toISOString().split("T")[0]);
    setApprovedMessage("");
    setConsentConfirmed(false);
    setNextAction("Send first follow-up");
  }

  function handleCreateFollowUp() {
    if (!patientName.trim()) {
      toast.error("Patient name is required");
      return;
    }
    if (!consentConfirmed) {
      toast.error("Consent must be confirmed", {
        description: "Acknowledge communication consent before creating the follow-up.",
      });
      return;
    }
    const value = Number(estimatedValue || "0");
    const tf = demoTreatmentFollowUp.create({
      patientName: patientName.trim(),
      treatmentType,
      estimatedValue: Number.isFinite(value) ? value : 0,
      assigneeId: coordinatorId,
      nextAction,
    });
    demoAudit.add({
      id: `al_${Date.now()}`,
      actor: "System",
      actorType: "system",
      action: "Treatment follow-up queued with approved message",
      resource: `TreatmentFollowUp ${tf.id}`,
      at: new Date().toISOString(),
      ip: "internal",
      result: "success",
      details: `Patient: ${patientName.trim()} · Treatment: ${treatmentType} · Est. value: ${formatPrice(Number.isFinite(value) ? value : 0)} · Follow-up date: ${followUpDate || "—"} · Coordinator: ${coordinators.find((c) => c.id === coordinatorId)?.name ?? coordinatorId} · Approved message: "${approvedMessage.slice(0, 140) || "(none)"}"`,
    });
    toast.success("Follow-up created", {
      description: `${patientName.trim()} added for ${treatmentType}. First outreach will use the approved message.`,
    });
    resetNewForm();
    setNewOpen(false);
  }

  function handleSendFollowUp(id: string, patientName: string) {
    const result = demoTreatmentFollowUp.sendSimulatedFollowUp(id);
    if (result.success) {
      toast.success("Follow-up sent (simulated)", {
        description: `${patientName}: approved message sent. Awaiting response.`,
      });
    } else {
      toast.error("Follow-up blocked", { description: `${patientName}: ${result.reason}` });
    }
  }

  function handleCallCoordinator(id: string, patientName: string) {
    demoTreatmentFollowUp.requestCoordinator(id);
    toast.success("Human call task created", {
      description: `${patientName}: a coordinator call task was added to the queue.`,
    });
  }

  function handleMarkResponded(id: string) {
    demoTreatmentFollowUp.markPatientResponded(id);
    toast.success("Marked as responded");
  }
  function handleQuestionPending(id: string) {
    demoTreatmentFollowUp.update(id, { stage: "question_pending", nextAction: "Answer patient question" });
    toast.info("Stage set to question pending", { description: "Awaiting a clarifying answer before next step." });
  }
  function handleNotReady(id: string) {
    demoTreatmentFollowUp.markNotReady(id);
    toast.info("Marked not ready", { description: "Paused — patient is not ready to proceed." });
  }
  function handleDeclined(id: string) {
    demoTreatmentFollowUp.markDeclined(id);
    toast.info("Marked declined");
  }
  function handleClose(id: string) {
    demoTreatmentFollowUp.close(id);
    toast.success("Follow-up closed");
  }
  function handleAssign(id: string, assigneeId: string) {
    const member = team.find((t) => t.id === assigneeId);
    demoTreatmentFollowUp.assign(id, assigneeId);
    toast.success("Coordinator assigned", { description: member ? `Now owned by ${member.name}.` : "Assignee updated." });
  }

  function openBookDialog(tfId: string) {
    const tf = state.treatmentFollowUps.find((t) => t.id === tfId);
    setBookTfId(tfId);
    setBookPatient(tf?.patientName ?? "");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookDate(tomorrow.toISOString().split("T")[0]);
    setBookTime("10:00");
    setBookType(appointmentTypes[3].id);
    setBookOpen(true);
  }

  function handleConfirmBooking() {
    if (!bookTfId || !selectedTf) return;
    if (!bookDate || !bookTime) {
      toast.error("Date and time are required");
      return;
    }
    const type = appointmentTypes.find((t) => t.id === bookType) ?? appointmentTypes[3];
    const start = new Date(`${bookDate}T${bookTime}`);
    const end = new Date(start.getTime() + type.duration * 60000);
    const appt = demoTreatmentFollowUp.bookAppointment(bookTfId, {
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      type: type.name,
      appointmentTypeId: type.id,
      title: `${selectedTf.treatmentType} (treatment follow-up)`,
    });
    if (!appt) {
      toast.error("Could not book appointment", { description: "Follow-up not found." });
      return;
    }
    setLastBooked({ appointmentId: appt.id, patientName: selectedTf.patientName, treatmentType: selectedTf.treatmentType });
    toast.success("Appointment booked", {
      description: `${selectedTf.patientName}: ${type.name} on ${start.toLocaleString("en-IN", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true })}.`,
      action: {
        label: "Open calendar",
        onClick: () => { window.location.href = "/app/calendar"; },
      },
    });
    setBookOpen(false);
    setBookTfId(null);
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Treatment Follow-up"
        subtitle="Follow up on unfinished treatment plans without pressuring patients. All communication is simulated."
        action={
          <Button size="sm" onClick={() => { resetNewForm(); setNewOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> New follow-up
          </Button>
        }
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

      {/* Last booked appointment banner */}
      {lastBooked && (
        <Card className="mb-6 border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/[0.05]">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.45_0.08_155)]">
                  <CalendarCheck className="h-3.5 w-3.5" /> Appointment booked
                </div>
                <div className="mt-1 text-sm font-medium">
                  {lastBooked.patientName} → {lastBooked.treatmentType}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  Appointment ID: <span className="font-mono">{lastBooked.appointmentId}</span>
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
              const isActive = tf.stage !== "closed" && tf.stage !== "declined" && tf.stage !== "appointment_booked";
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
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => handleCallCoordinator(tf.id, tf.patientName)}>
                          <Phone className="h-3 w-3" /> Call coordinator
                        </Button>
                      )}
                      {(tf.stage === "follow_up_due" || tf.stage === "first_message") && (
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => handleSendFollowUp(tf.id, tf.patientName)}>
                          <Send className="h-3 w-3" /> Send follow-up
                        </Button>
                      )}
                      {tf.stage !== "appointment_booked" && tf.stage !== "closed" && tf.stage !== "declined" && (
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => openBookDialog(tf.id)}>
                          <CalendarPlus className="h-3 w-3" /> Book appointment
                        </Button>
                      )}
                      {tf.stage === "appointment_booked" && (
                        <Badge variant="outline" className="gap-1 text-[10px] text-[oklch(0.45_0.08_155)]">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Booked
                        </Badge>
                      )}
                      {isActive && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Stage actions">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Stage actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleMarkResponded(tf.id)}>
                              <MessageSquareReply className="h-3.5 w-3.5" /> Mark patient responded
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleQuestionPending(tf.id)}>
                              <HelpCircle className="h-3.5 w-3.5" /> Question pending
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleCallCoordinator(tf.id, tf.patientName)}>
                              <Phone className="h-3.5 w-3.5" /> Request coordinator
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleNotReady(tf.id)}>
                              <Pause className="h-3.5 w-3.5" /> Mark not ready
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDeclined(tf.id)}>
                              <XCircle className="h-3.5 w-3.5" /> Mark declined
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleClose(tf.id)}>
                              <Archive className="h-3.5 w-3.5" /> Close
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Reassign coordinator
                            </DropdownMenuLabel>
                            {coordinators.map((c) => (
                              <DropdownMenuItem
                                key={c.id}
                                onSelect={() => handleAssign(tf.id, c.id)}
                                disabled={tf.assigneeId === c.id}
                              >
                                <UserCog className="h-3.5 w-3.5" /> {c.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No treatment follow-ups in this filter.</div>
            )}
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

      {/* New follow-up dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New treatment follow-up</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="tf-patient" className="text-xs">Patient</Label>
                <Input
                  id="tf-patient"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="e.g. Vikram Joshi"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Treatment type</Label>
                <Select value={treatmentType} onValueChange={setTreatmentType}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {treatmentTypeOptions.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="tf-value" className="text-xs">Estimated value ($)</Label>
                <Input
                  id="tf-value"
                  type="number"
                  min={0}
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="h-9 text-sm"
                  placeholder="e.g. 1200"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tf-date" className="text-xs">Follow-up date</Label>
                <Input
                  id="tf-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Assigned coordinator</Label>
                <Select value={coordinatorId} onValueChange={setCoordinatorId}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {coordinators.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="tf-next" className="text-xs">Next action</Label>
                <Input
                  id="tf-next"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="tf-msg" className="text-xs">Approved message</Label>
              <Textarea
                id="tf-msg"
                value={approvedMessage}
                onChange={(e) => setApprovedMessage(e.target.value)}
                className="min-h-16 text-xs"
                placeholder="Practice-approved first follow-up message — no clinical promises, no pressure."
              />
              <p className="text-[10px] text-muted-foreground">Stored in the audit log. Only practice-approved language may be used.</p>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
              <div>
                <div className="text-xs font-medium">Consent confirmed</div>
                <div className="text-[10px] text-muted-foreground">Patient has given communication consent. Required to send.</div>
              </div>
              <Switch checked={consentConfirmed} onCheckedChange={setConsentConfirmed} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFollowUp}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Create follow-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Book appointment dialog */}
      <Dialog open={bookOpen} onOpenChange={setBookOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book treatment appointment</DialogTitle>
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
