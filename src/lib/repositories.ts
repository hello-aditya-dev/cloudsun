/**
 * Repository interfaces and demo implementations.
 *
 * Components import these repositories instead of touching demo data arrays
 * directly. In production, swap DemoXRepository for PrismaXRepository that
 * implements the same interface against a real database.
 */

import type {
  Appointment, AuditEntry, Automation, Call, Contact, Conversation,
  Integration, KnowledgeSource, Message,
} from "@/types/domain";
import {
  getDemoState, resetDemoWorkspace, setDemoState, subscribe, type AIConfigState, type DemoState,
} from "./demo-store";

export interface ConversationRepository {
  list(): Conversation[];
  getById(id: string): Conversation | undefined;
  update(id: string, patch: Partial<Conversation>): void;
  bulkUpdate(ids: string[], patch: Partial<Conversation>): void;
  appendMessage(conversationId: string, message: Message): void;
  getMessages(conversationId: string): Message[];
}

export interface ContactRepository {
  list(): Contact[];
  getById(id: string): Contact | undefined;
  update(id: string, patch: Partial<Contact>): void;
  addNote(id: string, note: string): void;
}

export interface CallRepository {
  list(): Call[];
  getById(id: string): Call | undefined;
  save(call: Call): void;
}

export interface IntegrationRepository {
  list(): Integration[];
  update(id: string, patch: Partial<Integration>): void;
}

export interface AutomationRepository {
  list(): Automation[];
  update(id: string, patch: Partial<Automation>): void;
  remove(id: string): void;
}

export interface KnowledgeRepository {
  list(): KnowledgeSource[];
  update(id: string, patch: Partial<KnowledgeSource>): void;
  remove(id: string): void;
}

export interface AuditRepository {
  list(): AuditEntry[];
  add(entry: AuditEntry): void;
}

export interface AIConfigRepository {
  get(): AIConfigState;
  update(patch: Partial<AIConfigState>): void;
  publish(): void;
}

export interface DemoWorkspaceRepository {
  getState(): DemoState;
  subscribe(cb: () => void): () => void;
  reset(): void;
}

/* --------------------------- Demo implementations ------------------------- */

class DemoConversationRepository implements ConversationRepository {
  list() {
    return getDemoState().conversations;
  }
  getById(id: string) {
    return getDemoState().conversations.find((c) => c.id === id);
  }
  update(id: string, patch: Partial<Conversation>) {
    setDemoState((s) => ({
      ...s,
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }
  bulkUpdate(ids: string[], patch: Partial<Conversation>) {
    setDemoState((s) => ({
      ...s,
      conversations: s.conversations.map((c) => (ids.includes(c.id) ? { ...c, ...patch } : c)),
    }));
  }
  appendMessage(conversationId: string, message: Message) {
    setDemoState((s) => {
      const existing = s.messages[conversationId] ?? [];
      const conv = s.conversations.find((c) => c.id === conversationId);
      return {
        ...s,
        messages: { ...s.messages, [conversationId]: [...existing, message] },
        conversations: conv
          ? s.conversations.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    preview: message.author === "customer" ? message.body : c.preview,
                    lastAt: message.createdAt,
                    unread: message.author === "customer" ? c.unread + 1 : 0,
                  }
                : c,
            )
          : s.conversations,
      };
    });
  }
  getMessages(conversationId: string) {
    return getDemoState().messages[conversationId] ?? [];
  }
}

class DemoContactRepository implements ContactRepository {
  list() { return getDemoState().contacts; }
  getById(id: string) { return getDemoState().contacts.find((c) => c.id === id); }
  update(id: string, patch: Partial<Contact>) {
    setDemoState((s) => ({
      ...s,
      contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }
  addNote(id: string, note: string) {
    const c = this.getById(id);
    if (!c) return;
    this.update(id, { notes: c.notes ? `${c.notes}\n\n${note}` : note });
  }
}

class DemoCallRepository implements CallRepository {
  list() { return getDemoState().calls; }
  getById(id: string) { return getDemoState().calls.find((c) => c.id === id); }
  save(call: Call) {
    setDemoState((s) => {
      const exists = s.calls.some((c) => c.id === call.id);
      return {
        ...s,
        calls: exists ? s.calls.map((c) => (c.id === call.id ? call : c)) : [call, ...s.calls],
      };
    });
  }
}

class DemoIntegrationRepository implements IntegrationRepository {
  list() { return getDemoState().integrations; }
  update(id: string, patch: Partial<Integration>) {
    setDemoState((s) => ({
      ...s,
      integrations: s.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }
}

class DemoAutomationRepository implements AutomationRepository {
  list() { return getDemoState().automations; }
  update(id: string, patch: Partial<Automation>) {
    setDemoState((s) => ({
      ...s,
      automations: s.automations.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }
  remove(id: string) {
    setDemoState((s) => ({ ...s, automations: s.automations.filter((a) => a.id !== id) }));
  }
}

class DemoKnowledgeRepository implements KnowledgeRepository {
  list() { return getDemoState().knowledgeSources; }
  update(id: string, patch: Partial<KnowledgeSource>) {
    setDemoState((s) => ({
      ...s,
      knowledgeSources: s.knowledgeSources.map((k) => (k.id === id ? { ...k, ...patch } : k)),
    }));
  }
  remove(id: string) {
    setDemoState((s) => ({ ...s, knowledgeSources: s.knowledgeSources.filter((k) => k.id !== id) }));
  }
}

class DemoAuditRepository implements AuditRepository {
  list() { return getDemoState().auditLog; }
  add(entry: AuditEntry) {
    setDemoState((s) => ({ ...s, auditLog: [entry, ...s.auditLog] }));
  }
}

class DemoAIConfigRepository implements AIConfigRepository {
  get() { return getDemoState().aiConfig; }
  update(patch: Partial<AIConfigState>) {
    setDemoState((s) => ({
      ...s,
      aiConfig: { ...s.aiConfig, ...patch, draftVersion: s.aiConfig.draftVersion + 1 },
    }));
  }
  publish() {
    setDemoState((s) => ({
      ...s,
      aiConfig: { ...s.aiConfig, publishedAt: new Date().toISOString() },
    }));
  }
}

class DemoWorkspaceRepositoryImpl implements DemoWorkspaceRepository {
  getState() { return getDemoState(); }
  subscribe(cb: () => void) { return subscribe(cb); }
  reset() { resetDemoWorkspace(); }
}

export const demoConversations = new DemoConversationRepository();
export const demoContacts = new DemoContactRepository();
export const demoCalls = new DemoCallRepository();
export const demoIntegrations = new DemoIntegrationRepository();
export const demoAutomations = new DemoAutomationRepository();
export const demoKnowledge = new DemoKnowledgeRepository();
export const demoAudit = new DemoAuditRepository();
export const demoAIConfig = new DemoAIConfigRepository();
export const demoWorkspace = new DemoWorkspaceRepositoryImpl();

// ─── Recall, Waitlist, Treatment Follow-up repositories ──────────────────────

import type { RecallCase, WaitlistEntry, TreatmentFollowUp, OpenSlot } from "@/data/demo";
// Appointment already imported at top of file

// ─── Expanded AppointmentRepository ─────────────────────────────────────────

export interface AppointmentRepository {
  list(): Appointment[];
  getById(id: string): Appointment | undefined;
  create(data: Partial<Appointment> & { contactId: string; contactName: string; title: string; startAt: string; endAt: string }): Appointment;
  update(id: string, patch: Partial<Appointment>): void;
  reschedule(id: string, startAt: string, endAt: string): void;
  cancel(id: string, reason?: string): void;
  checkConflict(data: { startAt: string; endAt: string; assigneeId?: string }): Appointment | undefined;
  listByLocation(locationId: string): Appointment[];
  listByProvider(providerId: string): Appointment[];
  remove(id: string): void;
}

// Expand the existing DemoAppointmentRepository
class DemoAppointmentRepositoryImpl implements AppointmentRepository {
  list() { return getDemoState().appointments; }
  getById(id: string) { return getDemoState().appointments.find((a) => a.id === id); }
  create(data: Partial<Appointment> & { contactId: string; contactName: string; title: string; startAt: string; endAt: string }): Appointment {
    const id = `ap_${Date.now()}`;
    const appt: Appointment = {
      id,
      contactId: data.contactId,
      contactName: data.contactName,
      title: data.title,
      startAt: data.startAt,
      endAt: data.endAt,
      status: data.status ?? "requested",
      source: data.source ?? "phone",
      assigneeId: data.assigneeId,
      channel: data.channel ?? "phone",
      timezone: data.timezone ?? "Asia/Calcutta",
      type: data.type ?? "Consultation",
      location: data.location,
      notes: data.notes,
      providerId: data.providerId,
      locationId: data.locationId,
      appointmentTypeId: data.appointmentTypeId,
      bookingSource: data.bookingSource,
      bookingMode: data.bookingMode,
      confirmationStatus: data.confirmationStatus,
      createdFromWaitlistEntryId: data.createdFromWaitlistEntryId,
      createdFromCancellationSlotId: data.createdFromCancellationSlotId,
      internalNote: data.internalNote,
    };
    setDemoState((s) => ({ ...s, appointments: [...s.appointments, appt] }));
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Created appointment", resource: `Appointment ${id}`, at: new Date().toISOString(), ip: "internal", result: "success", details: `${appt.title} for ${appt.contactName}` });
    return appt;
  }
  update(id: string, patch: Partial<Appointment>) {
    setDemoState((s) => ({
      ...s,
      appointments: s.appointments.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  }
  reschedule(id: string, startAt: string, endAt: string) {
    this.update(id, { startAt, endAt });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Rescheduled appointment", resource: `Appointment ${id}`, at: new Date().toISOString(), ip: "internal", result: "success" });
  }
  cancel(id: string, reason?: string) {
    this.update(id, { status: "cancelled" });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Cancelled appointment", resource: `Appointment ${id}`, at: new Date().toISOString(), ip: "internal", result: "success", details: reason });
  }
  checkConflict(data: { startAt: string; endAt: string; assigneeId?: string; excludeAppointmentId?: string }): Appointment | undefined {
    const newStart = new Date(data.startAt).getTime();
    const newEnd = new Date(data.endAt).getTime();
    const appts = getDemoState().appointments;
    return appts.find((a) => {
      if (a.id === data.excludeAppointmentId) return false;
      if (a.status === "cancelled") return false;
      if (data.assigneeId && a.assigneeId && a.assigneeId !== data.assigneeId) return false;
      const existingStart = new Date(a.startAt).getTime();
      const existingEnd = new Date(a.endAt).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });
  }
  listByLocation(locationId: string) {
    return getDemoState().appointments.filter((a) => a.locationId === locationId || a.location?.includes(locationId));
  }
  listByProvider(providerId: string) {
    return getDemoState().appointments.filter((a) => a.providerId === providerId || a.assigneeId === providerId);
  }
  remove(id: string) {
    setDemoState((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
  }
}

// ─── OpenSlotRepository ──────────────────────────────────────────────────────

export interface OpenSlotRepository {
  list(): OpenSlot[];
  getById(id: string): OpenSlot | undefined;
  create(slot: Partial<OpenSlot>): OpenSlot;
  update(id: string, patch: Partial<OpenSlot>): void;
  markFilled(id: string, appointmentId: string, waitlistEntryId: string): void;
  expire(id: string): void;
}

class DemoOpenSlotRepository implements OpenSlotRepository {
  list() { return getDemoState().openSlots; }
  getById(id: string) { return getDemoState().openSlots.find((s) => s.id === id); }
  create(slot: Partial<OpenSlot>): OpenSlot {
    const id = `os_${Date.now()}`;
    const newSlot: OpenSlot = {
      id,
      date: slot.date ?? new Date().toISOString().split("T")[0],
      time: slot.time ?? "09:00",
      duration: slot.duration ?? 30,
      locationId: slot.locationId ?? "loc_central",
      locationName: slot.locationName ?? "Central",
      providerId: slot.providerId ?? "u_priya",
      providerName: slot.providerName ?? "Dr. Priya Sharma",
      appointmentType: slot.appointmentType ?? "Consultation",
      estimatedValue: slot.estimatedValue ?? 100,
      status: "open",
      sourceCancellationId: slot.sourceCancellationId,
    };
    setDemoState((s) => ({ ...s, openSlots: [...s.openSlots, newSlot] }));
    return newSlot;
  }
  update(id: string, patch: Partial<OpenSlot>) {
    setDemoState((s) => ({
      ...s,
      openSlots: s.openSlots.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }
  markFilled(id: string, appointmentId: string, waitlistEntryId: string) {
    this.update(id, { status: "filled", linkedAppointmentId: appointmentId, filledByWaitlistEntryId: waitlistEntryId, filledAt: new Date().toISOString() });
  }
  expire(id: string) { this.update(id, { status: "expired" }); }
}

// ─── RecallRepository ────────────────────────────────────────────────────────

export interface RecallRepository {
  list(): RecallCase[];
  getById(id: string): RecallCase | undefined;
  create(caseData: Partial<RecallCase>): RecallCase;
  update(id: string, patch: Partial<RecallCase>): void;
  bulkUpdate(ids: string[], patch: Partial<RecallCase>): void;
  sendReminder(id: string): { success: boolean; reason?: string };
  sendBulkReminder(ids: string[]): { sent: number; skipped: number; reasons: string[] };
  changeStatus(id: string, status: RecallCase["status"]): void;
  assign(id: string, assigneeId: string): void;
  pause(id: string): void;
  markResponded(id: string): void;
  markBooked(id: string, appointmentId: string): void;
  decline(id: string): void;
  markDoNotContact(id: string): void;
  close(id: string): void;
}

class DemoRecallRepository implements RecallRepository {
  list() { return getDemoState().recallCases; }
  getById(id: string) { return getDemoState().recallCases.find((r) => r.id === id); }
  create(caseData: Partial<RecallCase>): RecallCase {
    const id = `rc_${Date.now()}`;
    const newCase: RecallCase = {
      id,
      patientId: caseData.patientId ?? "",
      patientName: caseData.patientName ?? "",
      status: caseData.status ?? "due_now",
      recallDue: caseData.recallDue ?? new Date().toISOString(),
      lastContact: null,
      channel: caseData.channel ?? "phone",
      assigneeId: caseData.assigneeId ?? "",
      outcome: "Not yet contacted",
      nextAction: "Send reminder",
    };
    setDemoState((s) => ({ ...s, recallCases: [...s.recallCases, newCase] }));
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Created recall case", resource: `RecallCase ${id}`, at: new Date().toISOString(), ip: "internal", result: "success" });
    return newCase;
  }
  update(id: string, patch: Partial<RecallCase>) {
    setDemoState((s) => ({
      ...s,
      recallCases: s.recallCases.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    }));
  }
  bulkUpdate(ids: string[], patch: Partial<RecallCase>) {
    setDemoState((s) => ({
      ...s,
      recallCases: s.recallCases.map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r)),
    }));
  }
  sendReminder(id: string): { success: boolean; reason?: string } {
    const rc = this.getById(id);
    if (!rc) return { success: false, reason: "Recall case not found" };
    if (rc.status === "do_not_contact") return { success: false, reason: "Patient is on do-not-contact list" };
    // Check consent on the patient
    const patient = getDemoState().contacts.find((c) => c.id === rc.patientId);
    if (patient && !patient.consent.marketing) return { success: false, reason: "Patient has not given marketing consent" };
    this.update(id, { status: "contacted", lastContact: new Date().toISOString(), outcome: "Reminder sent (simulated)", nextAction: "Awaiting response" });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "CloudSun AI", actorType: "ai", action: "Sent recall reminder (simulated)", resource: `RecallCase ${id}`, at: new Date().toISOString(), ip: "ai-worker", result: "success", details: "Simulated outreach. No real patient contacted." });
    return { success: true };
  }
  sendBulkReminder(ids: string[]): { sent: number; skipped: number; reasons: string[] } {
    let sent = 0, skipped = 0;
    const reasons: string[] = [];
    for (const id of ids) {
      const result = this.sendReminder(id);
      if (result.success) { sent++; }
      else { skipped++; if (result.reason) reasons.push(`${id}: ${result.reason}`); }
    }
    return { sent, skipped, reasons };
  }
  changeStatus(id: string, status: RecallCase["status"]) { this.update(id, { status }); }
  assign(id: string, assigneeId: string) { this.update(id, { assigneeId }); }
  pause(id: string) { this.update(id, { nextAction: "Paused" }); }
  markResponded(id: string) { this.update(id, { status: "responded", outcome: "Patient responded", nextAction: "Offer appointment" }); }
  markBooked(id: string, appointmentId: string) { this.update(id, { status: "booked", outcome: "Appointment booked", nextAction: "Complete" }); demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Recall booked", resource: `RecallCase ${id} → Appointment ${appointmentId}`, at: new Date().toISOString(), ip: "internal", result: "success" }); }
  decline(id: string) { this.update(id, { status: "declined", outcome: "Patient declined", nextAction: "Closed" }); }
  markDoNotContact(id: string) { this.update(id, { status: "do_not_contact", outcome: "Do not contact", nextAction: "Closed" }); }
  close(id: string) { this.update(id, { nextAction: "Closed" }); }
}

// ─── WaitlistRepository ──────────────────────────────────────────────────────

export interface WaitlistRepository {
  list(): WaitlistEntry[];
  getById(id: string): WaitlistEntry | undefined;
  create(entry: Partial<WaitlistEntry>): WaitlistEntry;
  update(id: string, patch: Partial<WaitlistEntry>): void;
  rankCandidates(openSlot: OpenSlot): WaitlistEntry[];
  invite(id: string, openSlotId: string): void;
  accept(id: string, openSlotId: string): void;
  decline(id: string, openSlotId: string): void;
  fillSlot(id: string, openSlot: OpenSlot): Appointment | null;
  stopRemainingInvitations(openSlotId: string, acceptedEntryId: string): void;
}

class DemoWaitlistRepository implements WaitlistRepository {
  list() { return getDemoState().waitlist; }
  getById(id: string) { return getDemoState().waitlist.find((w) => w.id === id); }
  create(entry: Partial<WaitlistEntry>): WaitlistEntry {
    const id = `wl_${Date.now()}`;
    const newEntry: WaitlistEntry = {
      id,
      patientId: entry.patientId ?? "",
      patientName: entry.patientName ?? "",
      preferredLocation: entry.preferredLocation ?? "Central",
      preferredProvider: entry.preferredProvider ?? "Any",
      appointmentType: entry.appointmentType ?? "Consultation",
      availability: entry.availability ?? "Any",
      contactPreference: entry.contactPreference ?? "phone",
      lastOutreach: null,
      acceptanceState: "waiting",
      matchReason: entry.matchReason ?? "New entry",
    };
    setDemoState((s) => ({ ...s, waitlist: [...s.waitlist, newEntry] }));
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Added to waitlist", resource: `WaitlistEntry ${id}`, at: new Date().toISOString(), ip: "internal", result: "success" });
    return newEntry;
  }
  update(id: string, patch: Partial<WaitlistEntry>) {
    setDemoState((s) => ({
      ...s,
      waitlist: s.waitlist.map((w) => (w.id === id ? { ...w, ...patch } : w)),
    }));
  }
  rankCandidates(openSlot: OpenSlot): WaitlistEntry[] {
    const candidates = getDemoState().waitlist.filter((w) => {
      // Exclude incompatible
      if (w.acceptanceState === "accepted" || w.acceptanceState === "declined") return false;
      // Check patient consent and do-not-contact
      const patient = getDemoState().contacts.find((c) => c.id === w.patientId);
      if (patient && patient.recallStatus === "do_not_contact") return false;
      if (patient && !patient.consent.recorded) return false;
      return true;
    });
    // Deterministic ranking by score
    return candidates.map((w) => {
      let score = 0;
      const reasons: string[] = [];
      if (w.preferredLocation === openSlot.locationName || w.preferredLocation === "Any") { score += 30; reasons.push("Location match"); }
      if (w.preferredProvider === openSlot.providerName || w.preferredProvider === "Any") { score += 25; reasons.push("Provider match"); }
      if (w.appointmentType === openSlot.appointmentType) { score += 20; reasons.push("Appointment type match"); }
      if (w.contactPreference) { score += 10; reasons.push("Contact preference available"); }
      score += 15; // base score for waiting
      return { ...w, matchReason: reasons.join(", "), _score: score };
    }).sort((a, b) => (b as any)._score - (a as any)._score) as WaitlistEntry[];
  }
  invite(id: string, openSlotId: string) {
    this.update(id, { acceptanceState: "invited", openSlotId, invitedAt: new Date().toISOString(), lastOutreach: new Date().toISOString(), invitationStoppedAt: undefined });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Waitlist invitation sent (simulated)", resource: `WaitlistEntry ${id} for slot ${openSlotId}`, at: new Date().toISOString(), ip: "internal", result: "success", details: "Simulated invitation. No real patient contacted." });
  }
  accept(id: string, openSlotId: string) {
    const entry = this.getById(id);
    if (!entry) return;
    // Validate entry belongs to this slot
    if (entry.openSlotId !== openSlotId) return;
    // Don't accept if slot already filled
    const slot = demoOpenSlots.getById(openSlotId);
    if (slot && slot.status === "filled") return;
    this.update(id, { acceptanceState: "accepted" });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "CloudSun AI", actorType: "ai", action: "Waitlist invitation accepted (simulated)", resource: `WaitlistEntry ${id} for slot ${openSlotId}`, at: new Date().toISOString(), ip: "ai-worker", result: "success" });
  }
  decline(id: string, openSlotId: string) {
    this.update(id, { acceptanceState: "declined" });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Waitlist invitation declined", resource: `WaitlistEntry ${id} for slot ${openSlotId}`, at: new Date().toISOString(), ip: "internal", result: "success" });
  }
  fillSlot(id: string, openSlot: OpenSlot): Appointment | null {
    const entry = this.getById(id);
    if (!entry) return null;
    if (entry.acceptanceState !== "accepted") return null;
    // Validate slot exists and is open
    const slot = demoOpenSlots.getById(openSlot.id);
    if (!slot) return null;
    if (slot.status !== "open") return null;
    // Validate entry belongs to this slot
    if (entry.openSlotId !== openSlot.id) return null;

    // 1. Create a real appointment through the appointment repository
    const appointment = demoAppointments.create({
      contactId: entry.patientId,
      contactName: entry.patientName,
      title: `${openSlot.appointmentType} (waitlist fill)`,
      startAt: new Date(openSlot.date + "T" + openSlot.time).toISOString(),
      endAt: new Date(new Date(openSlot.date + "T" + openSlot.time).getTime() + openSlot.duration * 60000).toISOString(),
      status: "waitlist_fill",
      source: "phone",
      channel: "phone",
      type: openSlot.appointmentType,
      location: openSlot.locationName,
      assigneeId: openSlot.providerId,
      providerId: openSlot.providerId,
      locationId: openSlot.locationId,
      bookingSource: "waitlist",
      bookingMode: "ai",
      createdFromWaitlistEntryId: id,
      createdFromCancellationSlotId: openSlot.id,
      confirmationStatus: "confirmed",
    });

    // 2. Mark the waitlist entry as filled and link appointment
    this.update(id, { acceptanceState: "filled", linkedAppointmentId: appointment.id });

    // 3. Mark the open slot as filled
    demoOpenSlots.markFilled(openSlot.id, appointment.id, id);

    // 4. Stop other active invitations for ONLY that slot
    this.stopRemainingInvitations(openSlot.id, id);

    // 4. Update related patient status
    const state = getDemoState();
    const patient = state.contacts.find((c) => c.id === entry.patientId);
    if (patient) {
      demoContacts.update(patient.id, { waitlistStatus: "filled", nextAppointmentId: appointment.id });
    }

    // 5. Add audit entry
    demoAudit.add({ id: `al_${Date.now()}`, actor: "CloudSun AI", actorType: "ai", action: "Cancellation slot filled from waitlist", resource: `WaitlistEntry ${id} → Appointment ${appointment.id}`, at: new Date().toISOString(), ip: "ai-worker", result: "success", details: `Created ${appointment.title} for ${appointment.contactName}. Remaining invitations stopped.` });

    return appointment;
  }
  stopRemainingInvitations(openSlotId: string, acceptedEntryId: string) {
    const state = getDemoState();
    // Only stop invitations for the SAME slot, not all invited entries
    const invited = state.waitlist.filter((w) =>
      w.openSlotId === openSlotId &&
      w.id !== acceptedEntryId &&
      w.acceptanceState === "invited"
    );
    if (invited.length === 0) return;
    setDemoState((s) => ({
      ...s,
      waitlist: s.waitlist.map((w) => {
        if (w.openSlotId === openSlotId && w.id !== acceptedEntryId && w.acceptanceState === "invited") {
          return { ...w, acceptanceState: "waiting", openSlotId: undefined, invitationStoppedAt: new Date().toISOString() };
        }
        return w;
      }),
    }));
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Stopped remaining waitlist invitations for slot", resource: `OpenSlot ${openSlotId}`, at: new Date().toISOString(), ip: "internal", result: "success", details: `${invited.length} invitation(s) stopped for this slot only.` });
  }
}

// ─── TreatmentFollowUpRepository ─────────────────────────────────────────────

export interface TreatmentFollowUpRepository {
  list(): TreatmentFollowUp[];
  getById(id: string): TreatmentFollowUp | undefined;
  create(record: Partial<TreatmentFollowUp>): TreatmentFollowUp;
  update(id: string, patch: Partial<TreatmentFollowUp>): void;
  assign(id: string, assigneeId: string): void;
  sendSimulatedFollowUp(id: string): { success: boolean; reason?: string };
  markPatientResponded(id: string): void;
  requestCoordinator(id: string): void;
  markNotReady(id: string): void;
  markDeclined(id: string): void;
  bookAppointment(id: string, appointmentData: Partial<Appointment> & { startAt: string; endAt: string }): Appointment | null;
  close(id: string): void;
}

class DemoTreatmentFollowUpRepository implements TreatmentFollowUpRepository {
  list() { return getDemoState().treatmentFollowUps; }
  getById(id: string) { return getDemoState().treatmentFollowUps.find((t) => t.id === id); }
  create(record: Partial<TreatmentFollowUp>): TreatmentFollowUp {
    const id = `tf_${Date.now()}`;
    const newRecord: TreatmentFollowUp = {
      id,
      patientId: record.patientId ?? "",
      patientName: record.patientName ?? "",
      treatmentType: record.treatmentType ?? "Consultation",
      estimatedValue: record.estimatedValue ?? 0,
      stage: "follow_up_due",
      lastContact: null,
      nextAction: "Send first follow-up",
      assigneeId: record.assigneeId ?? "u_leila",
    };
    setDemoState((s) => ({ ...s, treatmentFollowUps: [...s.treatmentFollowUps, newRecord] }));
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Created treatment follow-up", resource: `TreatmentFollowUp ${id}`, at: new Date().toISOString(), ip: "internal", result: "success" });
    return newRecord;
  }
  update(id: string, patch: Partial<TreatmentFollowUp>) {
    setDemoState((s) => ({
      ...s,
      treatmentFollowUps: s.treatmentFollowUps.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }
  assign(id: string, assigneeId: string) { this.update(id, { assigneeId }); }
  sendSimulatedFollowUp(id: string): { success: boolean; reason?: string } {
    const tf = this.getById(id);
    if (!tf) return { success: false, reason: "Follow-up not found" };
    const patient = getDemoState().contacts.find((c) => c.id === tf.patientId);
    if (!patient) return { success: false, reason: "Patient not found" };
    if (!patient.consent.marketing) return { success: false, reason: "Patient has not given communication consent" };
    if (patient.treatmentFollowUpStatus === "declined" || patient.treatmentFollowUpStatus === "closed") return { success: false, reason: "Treatment follow-up is closed" };
    if (patient.recallStatus === "do_not_contact") return { success: false, reason: "Patient is marked do not contact" };
    this.update(id, { stage: "first_message", lastContact: new Date().toISOString(), nextAction: "Awaiting response" });
    demoAudit.add({ id: `al_${Date.now()}`, actor: "CloudSun AI", actorType: "ai", action: "Sent treatment follow-up (simulated)", resource: `TreatmentFollowUp ${id}`, at: new Date().toISOString(), ip: "ai-worker", result: "success", details: "Simulated outreach. No real patient contacted." });
    return { success: true };
  }
  markPatientResponded(id: string) { this.update(id, { stage: "patient_responded", nextAction: "Review response" }); }
  requestCoordinator(id: string) { this.update(id, { stage: "coordinator_required", nextAction: "Coordinator to call patient" }); demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Human call task created", resource: `TreatmentFollowUp ${id}`, at: new Date().toISOString(), ip: "internal", result: "success", details: "Coordinator call task created." }); }
  markNotReady(id: string) { this.update(id, { stage: "not_ready", nextAction: "Paused — patient not ready" }); }
  markDeclined(id: string) { this.update(id, { stage: "declined", nextAction: "Closed" }); }
  bookAppointment(id: string, appointmentData: Partial<Appointment> & { startAt: string; endAt: string }): Appointment | null {
    const tf = this.getById(id);
    if (!tf) return null;
    const appointment = demoAppointments.create({
      ...appointmentData,
      contactId: tf.patientId,
      contactName: tf.patientName,
      title: appointmentData.title ?? `${tf.treatmentType} (treatment follow-up)`,
      startAt: appointmentData.startAt,
      endAt: appointmentData.endAt,
      bookingSource: "treatment_follow_up",
      bookingMode: "human",
    });
    this.update(id, { stage: "appointment_booked", nextAction: "Complete" });
    // Update patient
    const patient = getDemoState().contacts.find((c) => c.id === tf.patientId);
    if (patient) {
      demoContacts.update(patient.id, { nextAppointmentId: appointment.id, treatmentFollowUpStatus: "appointment_booked" });
    }
    demoAudit.add({ id: `al_${Date.now()}`, actor: "System", actorType: "system", action: "Treatment follow-up appointment booked", resource: `TreatmentFollowUp ${id} → Appointment ${appointment.id}`, at: new Date().toISOString(), ip: "internal", result: "success" });
    return appointment;
  }
  close(id: string) { this.update(id, { stage: "closed", nextAction: "Closed" }); }
}

// ─── Export singletons ──────────────────────────────────────────────────────

export const demoAppointments = new DemoAppointmentRepositoryImpl();
export const demoOpenSlots = new DemoOpenSlotRepository();
export const demoRecall = new DemoRecallRepository();
export const demoWaitlist = new DemoWaitlistRepository();
export const demoTreatmentFollowUp = new DemoTreatmentFollowUpRepository();
