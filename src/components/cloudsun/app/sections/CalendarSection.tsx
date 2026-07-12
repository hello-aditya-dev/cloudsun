"use client";

import { useState, useCallback, useMemo } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoState } from "@/hooks/use-demo-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { demoAppointments, demoWaitlist } from "@/lib/repositories";
import { appointmentTypes } from "@/config/cloudsun";
import { locations, team } from "@/data/demo";
import { ChannelIcon } from "../../shared/Channel";
import { timeOnly, formatDay } from "../../shared/format";
import type { Appointment, AppointmentStatus } from "@/types/domain";
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin,
  User, Calendar as CalIcon, X, CheckCircle, AlertCircle, Users,
  Building2, List, StickyNote,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

const PROVIDER_IDS = ["u_priya", "u_dr_kapoor", "u_dr_chen", "u_hyg_sara"] as const;

type CalView = "week" | "day" | "agenda" | "provider" | "location";

const CHANNEL_COLORS: Record<string, string> = {
  phone: "oklch(0.62 0.16 42)",
  email: "oklch(0.45 0.08 155)",
  whatsapp: "oklch(0.55 0.14 150)",
  webchat: "oklch(0.50 0.10 250)",
};

const STATUS_COLORS: Record<string, string> = {
  requested: "bg-[oklch(0.70_0.12_75)] text-[oklch(0.40_0.08_75)]",
  tentative: "bg-[oklch(0.65_0.05_250)] text-[oklch(0.35_0.10_250)]",
  confirmed: "bg-[oklch(0.45_0.08_155)]/15 text-[oklch(0.45_0.08_155)]",
  checked_in: "bg-[oklch(0.55_0.14_150)]/15 text-[oklch(0.45_0.10_150)]",
  completed: "bg-[oklch(0.5_0_0)]/10 text-[oklch(0.4_0_0)]",
  cancelled: "bg-[oklch(0.62_0.16_42)]/15 text-[oklch(0.55_0.14_42)]",
  no_show: "bg-[oklch(0.62_0.16_42)]/15 text-[oklch(0.55_0.14_42)]",
};

const BOOKING_SOURCES = ["phone", "email", "whatsapp", "webchat", "walk-in"] as const;

const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "requested", "tentative", "confirmed", "checked_in", "completed", "cancelled", "no_show",
];

// ─── Date helpers ─────────────────────────────────────────────────────────────

function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  // Monday = 1, Sunday = 0 → shift so Monday is start
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekDates(d: Date): Date[] {
  const start = getWeekStart(d);
  return Array.from({ length: 7 }).map((_, i) => {
    const dt = new Date(start);
    dt.setDate(dt.getDate() + i);
    return dt;
  });
}

function formatWeekRange(d: Date): string {
  const dates = getWeekDates(d);
  const s = dates[0];
  const e = dates[6];
  const sameMonth = s.getMonth() === e.getMonth();
  if (sameMonth) {
    return `${s.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${s.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${e.getFullYear()}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function apptOnDate(appts: Appointment[], date: Date): Appointment[] {
  return appts.filter((a) => isSameDay(new Date(a.startAt), date));
}

function apptInWeek(appts: Appointment[], weekDates: Date[]): Appointment[] {
  const start = weekDates[0].getTime();
  const end = weekDates[6].getTime() + 86400000 - 1;
  return appts.filter((a) => {
    const t = new Date(a.startAt).getTime();
    return t >= start && t <= end;
  });
}

// ─── New appointment form state ───────────────────────────────────────────────

interface NewApptForm {
  contactId: string;
  appointmentTypeId: string;
  providerId: string;
  locationId: string;
  date: string;
  startTime: string;
  duration: number;
  status: AppointmentStatus;
  bookingSource: string;
  internalNote: string;
}

const EMPTY_FORM: NewApptForm = {
  contactId: "",
  appointmentTypeId: "",
  providerId: "",
  locationId: "",
  date: "",
  startTime: "09:00",
  duration: 30,
  status: "requested",
  bookingSource: "phone",
  internalNote: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CalendarSection() {
  const state = useDemoState();
  const isMobile = useIsMobile();

  const appointments = state.appointments;
  const contacts = state.contacts;

  const [view, setView] = useState<CalView>(isMobile ? "agenda" : "week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newForm, setNewForm] = useState<NewApptForm>({ ...EMPTY_FORM });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [detailNote, setDetailNote] = useState("");
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [showRescheduleInput, setShowRescheduleInput] = useState(false);

  // Derived data
  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const today = new Date();

  // Providers (dentists + hygienists)
  const providers = useMemo(
    () => team.filter((t) => PROVIDER_IDS.includes(t.id as typeof PROVIDER_IDS[number])),
    [],
  );

  // Filtered appointments for current view
  const visibleAppts = useMemo(() => {
    if (view === "agenda") {
      // Show all non-cancelled, sorted
      return [...appointments]
        .filter((a) => a.status !== "cancelled")
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    }
    if (view === "day") return apptOnDate(appointments, currentDate);
    if (view === "week") return apptInWeek(appointments, weekDates);
    // provider/location views show all non-cancelled
    return appointments.filter((a) => a.status !== "cancelled");
  }, [appointments, view, currentDate, weekDates]);

  // ─── Navigation ───────────────────────────────────────────────────────────

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "day") next.setDate(next.getDate() - 1);
      else next.setDate(next.getDate() - 7);
      return next;
    });
  }, [view]);

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d);
      if (view === "day") next.setDate(next.getDate() + 1);
      else next.setDate(next.getDate() + 7);
      return next;
    });
  }, [view]);

  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  // ─── Feedback helper ─────────────────────────────────────────────────────

  const showFeedback = useCallback((type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  }, []);

  // ─── New appointment save ─────────────────────────────────────────────────

  const handleNewAppt = useCallback(() => {
    const { contactId, appointmentTypeId, providerId, locationId, date, startTime, duration, status, bookingSource, internalNote } = newForm;

    if (!contactId || !appointmentTypeId || !providerId || !locationId || !date || !startTime) {
      showFeedback("error", "Please fill in all required fields.");
      return;
    }

    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) {
      showFeedback("error", "Patient not found.");
      return;
    }

    const apptType = appointmentTypes.find((t) => t.id === appointmentTypeId);
    const startAt = new Date(`${date}T${startTime}:00+05:30`).toISOString();
    const endDate = new Date(`${date}T${startTime}:00+05:30`);
    endDate.setMinutes(endDate.getMinutes() + (apptType?.duration ?? duration));
    const endAt = endDate.toISOString();

    // Check conflict
    const conflict = demoAppointments.checkConflict({ startAt, endAt, assigneeId: providerId });
    if (conflict) {
      showFeedback("error", `Conflict with "${conflict.title}" (${timeOnly(conflict.startAt)} – ${timeOnly(conflict.endAt)}). Choose another time or provider.`);
      return;
    }

    const provider = team.find((t) => t.id === providerId);
    const loc = locations.find((l) => l.id === locationId);

    demoAppointments.create({
      contactId,
      contactName: contact.name,
      title: apptType?.name ?? "Appointment",
      startAt,
      endAt,
      status,
      source: bookingSource as Appointment["source"],
      channel: bookingSource === "walk-in" ? "phone" : (bookingSource as Appointment["source"]),
      assigneeId: providerId,
      providerId,
      locationId,
      location: loc?.name,
      appointmentTypeId,
      bookingSource,
      bookingMode: "human",
      type: apptType?.name ?? "Consultation",
      internalNote: internalNote || undefined,
      notes: internalNote || undefined,
    });

    showFeedback("success", `Appointment booked for ${contact.name}.`);
    setShowNewDialog(false);
    setNewForm({ ...EMPTY_FORM });
  }, [newForm, contacts, showFeedback]);

  // ─── Detail actions ───────────────────────────────────────────────────────

  const handleReschedule = useCallback(() => {
    if (!selectedAppt || !rescheduleDate || !rescheduleTime) {
      showFeedback("error", "Please select date and time for rescheduling.");
      return;
    }
    const newStart = new Date(`${rescheduleDate}T${rescheduleTime}:00+05:30`).toISOString();
    const appt = demoAppointments.getById(selectedAppt.id);
    const currentDuration = appt ? new Date(appt.endAt).getTime() - new Date(appt.startAt).getTime() : 30 * 60000;
    const newEnd = new Date(new Date(newStart).getTime() + currentDuration).toISOString();

    const conflict = demoAppointments.checkConflict({ startAt: newStart, endAt: newEnd, assigneeId: selectedAppt.providerId });
    if (conflict && conflict.id !== selectedAppt.id) {
      showFeedback("error", `Conflict with "${conflict.title}" at ${timeOnly(conflict.startAt)}.`);
      return;
    }

    demoAppointments.reschedule(selectedAppt.id, newStart, newEnd);
    showFeedback("success", "Appointment rescheduled.");
    setSelectedAppt((prev) => prev ? { ...prev, startAt: newStart, endAt: newEnd } : null);
    setShowRescheduleInput(false);
  }, [selectedAppt, rescheduleDate, rescheduleTime, showFeedback]);

  const handleCancel = useCallback(() => {
    if (!selectedAppt) return;
    demoAppointments.cancel(selectedAppt.id, cancelReason || undefined);
    showFeedback("success", "Appointment cancelled.");
    setSelectedAppt((prev) => prev ? { ...prev, status: "cancelled" } : null);
    setShowCancelInput(false);
    setCancelReason("");
  }, [selectedAppt, cancelReason, showFeedback]);

  const handleStatusUpdate = useCallback((id: string, status: AppointmentStatus) => {
    demoAppointments.update(id, { status });
    showFeedback("success", `Status updated to ${status.replace("_", " ")}.`);
    setSelectedAppt((prev) => prev ? { ...prev, status } : null);
  }, [showFeedback]);

  const handleProviderChange = useCallback((providerId: string) => {
    if (!selectedAppt) return;
    const provider = team.find((t) => t.id === providerId);
    demoAppointments.update(selectedAppt.id, { providerId, assigneeId: providerId });
    showFeedback("success", `Provider changed to ${provider?.name ?? providerId}.`);
    setSelectedAppt((prev) => prev ? { ...prev, providerId, assigneeId: providerId } : null);
  }, [selectedAppt, showFeedback]);

  const handleLocationChange = useCallback((locationId: string) => {
    if (!selectedAppt) return;
    const loc = locations.find((l) => l.id === locationId);
    demoAppointments.update(selectedAppt.id, { locationId, location: loc?.name });
    showFeedback("success", `Location changed to ${loc?.name ?? locationId}.`);
    setSelectedAppt((prev) => prev ? { ...prev, locationId, location: loc?.name } : null);
  }, [selectedAppt, showFeedback]);

  const handleTypeChange = useCallback((appointmentTypeId: string) => {
    if (!selectedAppt) return;
    const at = appointmentTypes.find((t) => t.id === appointmentTypeId);
    const typeName = at?.name ?? appointmentTypeId;
    demoAppointments.update(selectedAppt.id, { appointmentTypeId, type: typeName });
    showFeedback("success", `Type changed to ${typeName}.`);
    setSelectedAppt((prev) => prev ? { ...prev, appointmentTypeId, type: typeName } : null);
  }, [selectedAppt, showFeedback]);

  const handleAddNote = useCallback(() => {
    if (!selectedAppt || !detailNote.trim()) return;
    demoAppointments.update(selectedAppt.id, { internalNote: detailNote.trim() });
    showFeedback("success", "Internal note added.");
    setSelectedAppt((prev) => prev ? { ...prev, internalNote: detailNote.trim() } : null);
    setDetailNote("");
  }, [selectedAppt, detailNote, showFeedback]);

  const handleAddToWaitlist = useCallback(() => {
    if (!selectedAppt) return;
    demoWaitlist.create({
      patientId: selectedAppt.contactId,
      patientName: selectedAppt.contactName,
      preferredLocation: selectedAppt.location ?? "Central",
      preferredProvider: selectedAppt.providerId ?? "Any",
      appointmentType: selectedAppt.type ?? "Consultation",
      contactPreference: selectedAppt.channel ?? "phone",
    });
    showFeedback("success", `${selectedAppt.contactName} added to waitlist.`);
  }, [selectedAppt, showFeedback]);

  // ─── View label ───────────────────────────────────────────────────────────

  const navLabel = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    }
    if (view === "week") return formatWeekRange(currentDate);
    if (view === "agenda") return "All appointments";
    if (view === "provider") return "By provider";
    return "By location";
  }, [view, currentDate]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SectionScroll>
      <PageHeader
        title="Calendar"
        subtitle="Day, week and agenda views with booking source, channel and assignee."
        action={
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              {(["week", "day", "agenda", "provider", "location"] as CalView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1 text-xs capitalize ${view === v ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => { setNewForm({ ...EMPTY_FORM, date: currentDate.toISOString().split("T")[0] }); setShowNewDialog(true); }}>
              <Plus className="h-3.5 w-3.5" /> New appointment
            </Button>
          </div>
        }
      />

      {/* Feedback banner */}
      {feedback && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm ${feedback.type === "success" ? "border-[oklch(0.45_0.08_155)]/30 bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.35_0.08_155)]" : "border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.55_0.16_42)]"}`}>
          {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {feedback.message}
        </div>
      )}

      {/* Navigation bar */}
      {view !== "agenda" && view !== "provider" && view !== "location" && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={goPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{navLabel}</span>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={goNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={goToday}>Today</Button>
        </div>
      )}

      {/* ── Agenda View ── */}
      {view === "agenda" && (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            {visibleAppts.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No appointments found.</div>
            ) : (
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {visibleAppts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAppt(a); setShowRescheduleInput(false); setShowCancelInput(false); setDetailNote(""); }}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/30"
                  >
                    <div className="flex w-16 flex-col items-center rounded-lg border border-border bg-muted/20 py-2 shrink-0">
                      <div className="text-[10px] uppercase text-muted-foreground">{formatDay(a.startAt).slice(0, 3)}</div>
                      <div className="font-serif text-xl leading-none">{new Date(a.startAt).getDate()}</div>
                      <div className="text-[10px] text-muted-foreground">{timeOnly(a.startAt)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.contactName} · {a.type}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ChannelIcon id={a.channel} className="h-3 w-3" />
                        <span className="capitalize">via {a.channel}</span>
                        {a.location && <><span>·</span><MapPin className="h-3 w-3" />{a.location}</>}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[a.status] ?? ""}`}>{a.status.replace("_", " ")}</Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Day View ── */}
      {view === "day" && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <DayView date={currentDate} appts={apptOnDate(appointments, currentDate)} onSelect={(a) => { setSelectedAppt(a); setShowRescheduleInput(false); setShowCancelInput(false); setDetailNote(""); }} />
          </CardContent>
        </Card>
      )}

      {/* ── Week View ── */}
      {view === "week" && (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((d, i) => {
                const isToday = isSameDay(d, today);
                return (
                  <div key={i} className="text-center">
                    <div className="text-[10px] uppercase text-muted-foreground">{DAY_NAMES[i]}</div>
                    <div className={`mt-0.5 font-serif text-lg ${isToday ? "text-[oklch(0.62_0.16_42)] font-bold" : ""}`}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {weekDates.map((d, i) => {
                const appts = apptOnDate(appointments, d);
                return (
                  <div key={i} className="min-h-[180px] space-y-1 rounded-lg border border-border bg-muted/20 p-1.5">
                    {appts.length === 0 && (
                      <div className="pt-4 text-center text-[10px] text-muted-foreground">No appts</div>
                    )}
                    {appts.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => { setSelectedAppt(a); setShowRescheduleInput(false); setShowCancelInput(false); setDetailNote(""); }}
                        className="block w-full rounded-md px-1.5 py-1 text-left text-[10px] text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: CHANNEL_COLORS[a.channel] ?? "oklch(0.5 0 0)" }}
                      >
                        <div className="font-medium">{timeOnly(a.startAt)}</div>
                        <div className="truncate opacity-90">{a.title}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Provider View ── */}
      {view === "provider" && (
        <div className="space-y-4">
          {providers.map((provider) => {
            const providerAppts = demoAppointments.listByProvider(provider.id).filter((a) => a.status !== "cancelled");
            return (
              <Card key={provider.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white" style={{ backgroundColor: provider.avatarColor }}>
                      {provider.initials}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{provider.name}</div>
                      <div className="text-[10px] text-muted-foreground">{provider.skills.slice(0, 3).join(", ")}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px]">{providerAppts.length} appt{providerAppts.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  {providerAppts.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">No appointments</div>
                  ) : (
                    <div className="space-y-1.5">
                      {providerAppts
                        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                        .map((a) => (
                          <button
                            key={a.id}
                            onClick={() => { setSelectedAppt(a); setShowRescheduleInput(false); setShowCancelInput(false); setDetailNote(""); }}
                            className="flex w-full items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-xs hover:bg-muted/40"
                          >
                            <div className="flex-shrink-0">
                              <div className="text-[10px] text-muted-foreground">{formatDay(a.startAt)}</div>
                              <div className="font-medium">{timeOnly(a.startAt)}</div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">{a.title}</div>
                              <div className="text-muted-foreground">{a.contactName}</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[a.status] ?? ""}`}>{a.status.replace("_", " ")}</Badge>
                          </button>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Location View ── */}
      {view === "location" && (
        <div className="space-y-4">
          {locations.map((loc) => {
            const locAppts = demoAppointments.listByLocation(loc.id).filter((a) => a.status !== "cancelled");
            return (
              <Card key={loc.id} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">{loc.name}</div>
                      <div className="text-[10px] text-muted-foreground">{loc.address}</div>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px]">{locAppts.length} appt{locAppts.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  {locAppts.length === 0 ? (
                    <div className="py-3 text-center text-xs text-muted-foreground">No appointments</div>
                  ) : (
                    <div className="space-y-1.5">
                      {locAppts
                        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                        .map((a) => (
                          <button
                            key={a.id}
                            onClick={() => { setSelectedAppt(a); setShowRescheduleInput(false); setShowCancelInput(false); setDetailNote(""); }}
                            className="flex w-full items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-left text-xs hover:bg-muted/40"
                          >
                            <div className="flex-shrink-0">
                              <div className="text-[10px] text-muted-foreground">{formatDay(a.startAt)}</div>
                              <div className="font-medium">{timeOnly(a.startAt)}</div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium">{a.title}</div>
                              <div className="text-muted-foreground">{a.contactName} · {team.find((t) => t.id === (a.providerId ?? a.assigneeId))?.name ?? "Unassigned"}</div>
                            </div>
                            <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[a.status] ?? ""}`}>{a.status.replace("_", " ")}</Badge>
                          </button>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Working hours + Appointment types */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Working hours
            </div>
            <div className="space-y-1.5 text-xs">
              {["Mon – Fri", "Saturday", "Sunday"].map((d, i) => (
                <div key={d} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-1.5">
                  <span className="text-muted-foreground">{d}</span>
                  <span>{i === 0 ? "9:00 – 18:00" : i === 1 ? "10:00 – 14:00" : "Closed"}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Buffer:</span><Badge variant="outline" className="text-[10px]">15 min</Badge>
              <span>·</span>
              <span>Timezone:</span><Badge variant="outline" className="text-[10px]">Asia/Calcutta</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalIcon className="h-3.5 w-3.5" /> Appointment types
            </div>
            <div className="space-y-1.5 text-xs max-h-64 overflow-y-auto">
              {appointmentTypes.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-1.5">
                  <span>{t.name}</span>
                  <span className="text-muted-foreground">{t.duration} min</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── New Appointment Dialog ── */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New appointment</DialogTitle>
            <DialogDescription>Book a new appointment for a patient.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            {/* Patient */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Patient *</Label>
              <Select value={newForm.contactId} onValueChange={(v) => setNewForm((f) => ({ ...f, contactId: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {contacts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Appointment type */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Appointment type *</Label>
              <Select value={newForm.appointmentTypeId} onValueChange={(v) => {
                const at = appointmentTypes.find((t) => t.id === v);
                setNewForm((f) => ({ ...f, appointmentTypeId: v, duration: at?.duration ?? 30 }));
              }}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.duration} min)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Provider *</Label>
              <Select value={newForm.providerId} onValueChange={(v) => setNewForm((f) => ({ ...f, providerId: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select provider" /></SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} — {p.skills[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Location *</Label>
              <Select value={newForm.locationId} onValueChange={(v) => setNewForm((f) => ({ ...f, locationId: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Date *</Label>
                <Input type="date" value={newForm.date} onChange={(e) => setNewForm((f) => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">Start time *</Label>
                <Input type="time" value={newForm.startTime} onChange={(e) => setNewForm((f) => ({ ...f, startTime: e.target.value }))} />
              </div>
            </div>

            {/* Duration (auto from type, but editable) */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Duration (minutes)</Label>
              <Input type="number" min={5} step={5} value={newForm.duration} onChange={(e) => setNewForm((f) => ({ ...f, duration: parseInt(e.target.value) || 30 }))} />
            </div>

            {/* Status */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={newForm.status} onValueChange={(v) => setNewForm((f) => ({ ...f, status: v as AppointmentStatus }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["requested", "tentative", "confirmed"].map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Booking source */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Booking source</Label>
              <Select value={newForm.bookingSource} onValueChange={(v) => setNewForm((f) => ({ ...f, bookingSource: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BOOKING_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Internal note */}
            <div className="grid gap-1.5">
              <Label className="text-xs">Internal note</Label>
              <Textarea
                rows={2}
                placeholder="Optional internal note…"
                value={newForm.internalNote}
                onChange={(e) => setNewForm((f) => ({ ...f, internalNote: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleNewAppt}>
              <Plus className="h-3.5 w-3.5" /> Book appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Appointment Detail Dialog ── */}
      <Dialog open={!!selectedAppt} onOpenChange={(open) => { if (!open) setSelectedAppt(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selectedAppt && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAppt.title}</DialogTitle>
                <DialogDescription>{selectedAppt.contactName}</DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-2">
                {/* Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {formatDay(selectedAppt.startAt)}, {timeOnly(selectedAppt.startAt)} – {timeOnly(selectedAppt.endAt)}</div>
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Assigned to {team.find((t) => t.id === (selectedAppt.providerId ?? selectedAppt.assigneeId))?.name ?? "Unassigned"}
                  </div>
                  <div className="flex items-center gap-2">
                    <ChannelIcon id={selectedAppt.channel} className="h-3.5 w-3.5 text-muted-foreground" /> Booked via {selectedAppt.bookingSource ?? selectedAppt.channel}
                  </div>
                  {selectedAppt.location && (
                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedAppt.location}</div>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] capitalize ${STATUS_COLORS[selectedAppt.status] ?? ""}`}>
                      {selectedAppt.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {selectedAppt.internalNote && (
                  <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs text-foreground/80">
                    <span className="font-medium">Note:</span> {selectedAppt.internalNote}
                  </div>
                )}

                {/* ── Quick status actions ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status actions</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAppt.status === "requested" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleStatusUpdate(selectedAppt.id, "confirmed")}>
                          <CheckCircle className="h-3 w-3" /> Confirm
                        </Button>
                      )}
                      {selectedAppt.status === "tentative" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleStatusUpdate(selectedAppt.id, "confirmed")}>
                          <CheckCircle className="h-3 w-3" /> Confirm
                        </Button>
                      )}
                      {selectedAppt.status === "confirmed" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleStatusUpdate(selectedAppt.id, "checked_in")}>
                          <Users className="h-3 w-3" /> Check in
                        </Button>
                      )}
                      {selectedAppt.status === "checked_in" && (
                        <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => handleStatusUpdate(selectedAppt.id, "completed")}>
                          <CheckCircle className="h-3 w-3" /> Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-7 text-[11px] text-[oklch(0.62_0.16_42)]" onClick={() => handleStatusUpdate(selectedAppt.id, "no_show")}>
                        <AlertCircle className="h-3 w-3" /> No-show
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Reschedule ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reschedule</div>
                    {!showRescheduleInput ? (
                      <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowRescheduleInput(true)}>
                        <CalendarDays className="h-3 w-3" /> Reschedule
                      </Button>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                          <Input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" className="h-7 text-[11px]" onClick={handleReschedule}>Save</Button>
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => setShowRescheduleInput(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Cancel ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Cancel</div>
                    {!showCancelInput ? (
                      <Button size="sm" variant="outline" className="h-7 text-[11px] text-[oklch(0.62_0.16_42)]" onClick={() => setShowCancelInput(true)}>
                        <X className="h-3 w-3" /> Cancel appointment
                      </Button>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                        <Input placeholder="Reason for cancellation" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="destructive" className="h-7 text-[11px]" onClick={handleCancel}>Confirm cancel</Button>
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => { setShowCancelInput(false); setCancelReason(""); }}>Back</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Change provider ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Change provider</div>
                    <Select value={selectedAppt.providerId ?? selectedAppt.assigneeId ?? ""} onValueChange={handleProviderChange}>
                      <SelectTrigger className="h-7 w-full text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* ── Change location ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Change location</div>
                    <Select value={selectedAppt.locationId ?? ""} onValueChange={handleLocationChange}>
                      <SelectTrigger className="h-7 w-full text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {locations.map((l) => (
                          <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* ── Change appointment type ── */}
                {selectedAppt.status !== "cancelled" && selectedAppt.status !== "completed" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Change type</div>
                    <Select value={selectedAppt.appointmentTypeId ?? ""} onValueChange={handleTypeChange}>
                      <SelectTrigger className="h-7 w-full text-[11px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map((t) => (
                          <SelectItem key={t.id} value={t.id}>{t.name} ({t.duration} min)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* ── Add internal note ── */}
                {selectedAppt.status !== "cancelled" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Internal note</div>
                    <div className="flex gap-1.5">
                      <Input placeholder="Add note…" value={detailNote} onChange={(e) => setDetailNote(e.target.value)} className="h-7 text-[11px]" />
                      <Button size="sm" className="h-7 text-[11px]" onClick={handleAddNote} disabled={!detailNote.trim()}>
                        <StickyNote className="h-3 w-3" /> Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Add to waitlist ── */}
                {selectedAppt.status === "cancelled" && (
                  <div className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Waitlist</div>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={handleAddToWaitlist}>
                      <List className="h-3 w-3" /> Add patient to waitlist
                    </Button>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAppt(null)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </SectionScroll>
  );
}

// ─── Day View sub-component ──────────────────────────────────────────────────

function DayView({ date, appts, onSelect }: { date: Date; appts: Appointment[]; onSelect: (a: Appointment) => void }) {
  const today = new Date();

  return (
    <div>
      <div className="mb-3 text-sm font-medium">
        {date.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        {isSameDay(date, today) && <span className="ml-2 text-[oklch(0.62_0.16_42)]">(Today)</span>}
      </div>
      <div className="space-y-1">
        {HOURS.map((h) => {
          const hourAppts = appts.filter((a) => new Date(a.startAt).getHours() === h);
          return (
            <div key={h} className="flex gap-3">
              <div className="w-12 shrink-0 py-1 text-[10px] text-muted-foreground">
                {h > 12 ? h - 12 : h}{h >= 12 ? " PM" : " AM"}
              </div>
              <div className="min-h-[48px] flex-1 border-t border-border/60 py-1">
                {hourAppts.length === 0 && (
                  <div className="text-[10px] text-muted-foreground/50">—</div>
                )}
                {hourAppts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSelect(a)}
                    className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-white"
                    style={{ backgroundColor: CHANNEL_COLORS[a.channel] ?? "oklch(0.5 0 0)" }}
                  >
                    <div>
                      <div className="font-medium">{timeOnly(a.startAt)} · {a.title}</div>
                      <div className="opacity-90">{a.contactName}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
