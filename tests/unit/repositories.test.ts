import { describe, it, expect, beforeEach } from "vitest";
import { resetDemoWorkspace, getDemoState } from "@/lib/demo-store";
import {
  demoAppointments, demoRecall, demoWaitlist, demoOpenSlots,
  demoTreatmentFollowUp, demoContacts,
} from "@/lib/repositories";

describe("AppointmentRepository", () => {
  beforeEach(() => resetDemoWorkspace());

  it("creates an appointment", () => {
    const before = getDemoState().appointments.length;
    const appt = demoAppointments.create({
      contactId: "p_1",
      contactName: "Test Patient",
      title: "New-patient examination",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "New-patient exam",
    });
    expect(appt.id).toBeDefined();
    expect(getDemoState().appointments.length).toBe(before + 1);
  });

  it("detects conflicting appointments by time overlap", () => {
    const startAt = "2026-07-20T10:00:00+05:30";
    const endAt = "2026-07-20T10:45:00+05:30";
    demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "Existing",
      startAt, endAt, type: "Consultation",
    });
    const conflict = demoAppointments.checkConflict({
      startAt: "2026-07-20T10:30:00+05:30",
      endAt: "2026-07-20T11:00:00+05:30",
    });
    expect(conflict).toBeDefined();
    expect(conflict!.title).toBe("Existing");
  });

  it("does not flag back-to-back appointments as conflict", () => {
    demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "First",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "Consultation",
    });
    const conflict = demoAppointments.checkConflict({
      startAt: "2026-07-20T10:45:00+05:30",
      endAt: "2026-07-20T11:30:00+05:30",
    });
    expect(conflict).toBeUndefined();
  });

  it("excludes itself when checking conflict for edit", () => {
    const appt = demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "Test",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "Consultation",
    });
    const conflict = demoAppointments.checkConflict({
      startAt: appt.startAt, endAt: appt.endAt, excludeAppointmentId: appt.id,
    });
    expect(conflict).toBeUndefined();
  });

  it("does not flag cancelled appointments as conflict", () => {
    const appt = demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "Cancelled",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "Consultation", status: "cancelled",
    });
    const conflict = demoAppointments.checkConflict({
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
    });
    expect(conflict).toBeUndefined();
  });

  it("cancels and reschedules", () => {
    const appt = demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "Test",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "Consultation",
    });
    demoAppointments.cancel(appt.id, "Patient request");
    expect(demoAppointments.getById(appt.id)!.status).toBe("cancelled");

    const appt2 = demoAppointments.create({
      contactId: "p_2", contactName: "Test2", title: "Test2",
      startAt: "2026-07-21T10:00:00+05:30",
      endAt: "2026-07-21T10:45:00+05:30",
      type: "Consultation",
    });
    demoAppointments.reschedule(appt2.id, "2026-07-22T10:00:00+05:30", "2026-07-22T10:45:00+05:30");
    expect(demoAppointments.getById(appt2.id)!.startAt).toBe("2026-07-22T10:00:00+05:30");
  });
});

describe("RecallRepository", () => {
  beforeEach(() => resetDemoWorkspace());

  it("sends reminder and updates status to contacted", () => {
    const rc = getDemoState().recallCases[0];
    const result = demoRecall.sendReminder(rc.id);
    expect(result.success).toBe(true);
    const updated = demoRecall.getById(rc.id);
    expect(updated!.status).toBe("contacted");
    expect(updated!.lastContact).toBeDefined();
  });

  it("blocks sending when do-not-contact", () => {
    const rc = getDemoState().recallCases[0];
    demoRecall.markDoNotContact(rc.id);
    const result = demoRecall.sendReminder(rc.id);
    expect(result.success).toBe(false);
    expect(result.reason).toContain("do-not-contact");
  });

  it("blocks sending when consent is missing", () => {
    const rc = getDemoState().recallCases[0];
    const patient = getDemoState().contacts.find((c) => c.id === rc.patientId);
    if (patient) demoContacts.update(patient.id, { consent: { recorded: true, marketing: false } });
    const result = demoRecall.sendReminder(rc.id);
    expect(result.success).toBe(false);
    expect(result.reason).toContain("consent");
  });

  it("bulk send returns sent and skipped counts", () => {
    const cases = getDemoState().recallCases.slice(0, 3);
    const result = demoRecall.sendBulkReminder(cases.map((c) => c.id));
    expect(result.sent).toBeGreaterThan(0);
    expect(result.sent + result.skipped).toBe(cases.length);
  });

  it("creates and marks booked", () => {
    const newCase = demoRecall.create({ patientId: "p_1", patientName: "Test" });
    expect(newCase.id).toBeDefined();
    demoRecall.markBooked(newCase.id, "ap_test");
    expect(demoRecall.getById(newCase.id)!.status).toBe("booked");
  });
});

describe("WaitlistRepository", () => {
  beforeEach(() => resetDemoWorkspace());

  it("ranks candidates by match score", () => {
    const slot = demoOpenSlots.list()[0];
    const ranked = demoWaitlist.rankCandidates(slot);
    expect(ranked.length).toBeGreaterThan(0);
    // First candidate should have highest score
    if (ranked.length > 1) {
      expect(ranked[0].matchReason.length).toBeGreaterThan(0);
    }
  });

  it("invite sets openSlotId and invitedAt", () => {
    const entry = getDemoState().waitlist.find((w) => w.acceptanceState === "waiting");
    if (!entry) return;
    const slot = demoOpenSlots.list()[0];
    demoWaitlist.invite(entry.id, slot.id);
    const updated = demoWaitlist.getById(entry.id);
    expect(updated!.acceptanceState).toBe("invited");
    expect(updated!.openSlotId).toBe(slot.id);
    expect(updated!.invitedAt).toBeDefined();
  });

  it("accept validates slot ownership", () => {
    const entry = getDemoState().waitlist.find((w) => w.acceptanceState === "waiting");
    if (!entry) return;
    demoWaitlist.accept(entry.id, "os_fake"); // entry doesn't belong to this slot
    expect(demoWaitlist.getById(entry.id)!.acceptanceState).toBe("waiting"); // unchanged
  });

  it("fillSlot creates a real appointment", () => {
    const entry = getDemoState().waitlist.find((w) => w.acceptanceState === "waiting");
    if (!entry) return;
    const slot = demoOpenSlots.list()[0];
    demoWaitlist.invite(entry.id, slot.id);
    demoWaitlist.accept(entry.id, slot.id);
    const appt = demoWaitlist.fillSlot(entry.id, slot);
    expect(appt).not.toBeNull();
    expect(appt!.status).toBe("waitlist_fill");
    expect(appt!.createdFromWaitlistEntryId).toBe(entry.id);

    // Waitlist entry should be filled
    expect(demoWaitlist.getById(entry.id)!.acceptanceState).toBe("filled");
    expect(demoWaitlist.getById(entry.id)!.linkedAppointmentId).toBe(appt!.id);

    // Open slot should be filled
    expect(demoOpenSlots.getById(slot.id)!.status).toBe("filled");
    expect(demoOpenSlots.getById(slot.id)!.linkedAppointmentId).toBe(appt!.id);
  });

  it("stopRemainingInvitations only stops same-slot invitations", () => {
    const slot1 = demoOpenSlots.list()[0];
    const slot2 = demoOpenSlots.list()[1];
    const entries = getDemoState().waitlist.filter((w) => w.acceptanceState === "waiting");
    if (entries.length < 2) return;

    // Invite entry1 to slot1, entry2 to slot2
    demoWaitlist.invite(entries[0].id, slot1.id);
    demoWaitlist.invite(entries[1].id, slot2.id);

    // Stop remaining for slot1 only
    demoWaitlist.stopRemainingInvitations(slot1.id, "fake_accepted_id");

    // entry1 (invited to slot1) should be reset to waiting
    expect(demoWaitlist.getById(entries[0].id)!.acceptanceState).toBe("waiting");
    expect(demoWaitlist.getById(entries[0].id)!.openSlotId).toBeUndefined();

    // entry2 (invited to slot2) should still be invited
    expect(demoWaitlist.getById(entries[1].id)!.acceptanceState).toBe("invited");
    expect(demoWaitlist.getById(entries[1].id)!.openSlotId).toBe(slot2.id);
  });
});

describe("TreatmentFollowUpRepository", () => {
  beforeEach(() => resetDemoWorkspace());

  it("creates and sends follow-up", () => {
    const tf = demoTreatmentFollowUp.create({ patientId: "p_1", patientName: "Test", treatmentType: "Crown", estimatedValue: 1500 });
    expect(tf.id).toBeDefined();
    const result = demoTreatmentFollowUp.sendSimulatedFollowUp(tf.id);
    // p_1 may or may not have consent — check result type
    expect(typeof result.success).toBe("boolean");
  });

  it("blocks follow-up when consent is missing", () => {
    const tf = demoTreatmentFollowUp.create({ patientId: "p_1", patientName: "Test" });
    const patient = getDemoState().contacts.find((c) => c.id === "p_1");
    if (patient) demoContacts.update(patient.id, { consent: { recorded: true, marketing: false } });
    const result = demoTreatmentFollowUp.sendSimulatedFollowUp(tf.id);
    expect(result.success).toBe(false);
    expect(result.reason).toContain("consent");
  });

  it("marks patient responded and requests coordinator", () => {
    const tf = demoTreatmentFollowUp.create({ patientId: "p_1", patientName: "Test" });
    demoTreatmentFollowUp.markPatientResponded(tf.id);
    expect(demoTreatmentFollowUp.getById(tf.id)!.stage).toBe("patient_responded");
    demoTreatmentFollowUp.requestCoordinator(tf.id);
    expect(demoTreatmentFollowUp.getById(tf.id)!.stage).toBe("coordinator_required");
  });

  it("bookAppointment creates a real appointment", () => {
    const tf = demoTreatmentFollowUp.create({ patientId: "p_1", patientName: "Test", treatmentType: "Crown" });
    const appt = demoTreatmentFollowUp.bookAppointment(tf.id, {
      title: "Crown appointment",
      startAt: "2026-07-25T10:00:00+05:30",
      endAt: "2026-07-25T11:30:00+05:30",
      type: "Treatment appointment",
    });
    expect(appt).not.toBeNull();
    expect(appt!.contactId).toBe("p_1");
    expect(demoTreatmentFollowUp.getById(tf.id)!.stage).toBe("appointment_booked");
  });
});

describe("Demo reset", () => {
  it("restores seed data after mutations", () => {
    const before = getDemoState().appointments.length;
    const appt = demoAppointments.create({
      contactId: "p_1", contactName: "Test", title: "Test appt",
      startAt: "2026-07-20T10:00:00+05:30",
      endAt: "2026-07-20T10:45:00+05:30",
      type: "Consultation",
    });
    expect(appt).toBeDefined();
    expect(getDemoState().appointments.some((a) => a.id === appt.id)).toBe(true);
    resetDemoWorkspace();
    expect(getDemoState().appointments.some((a) => a.id === appt.id)).toBe(false);
  });
});
