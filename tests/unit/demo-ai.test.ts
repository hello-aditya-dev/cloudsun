import { describe, it, expect } from "vitest";
import {
  detectIntent,
  generateDentalAIResponse,
  rewriteText,
  shortenText,
  makeFriendlier,
  makeMoreFormal,
  calculateROI,
} from "@/lib/demo-ai";

describe("detectIntent — dental", () => {
  it("detects new-patient booking", () => {
    const r = detectIntent("I'm a new patient and I'd like to book a check-up");
    expect(r.intent).toBe("new_patient_booking");
    expect(r.isEmergency).toBe(false);
  });

  it("detects tooth pain and triggers emergency screening", () => {
    const r = detectIntent("I have tooth pain and it's getting worse");
    expect(r.intent).toBe("tooth_pain");
    expect(r.isEmergency).toBe(false);
  });

  it("detects emergency red flags — severe swelling", () => {
    const r = detectIntent("I have severe facial swelling and can't breathe properly");
    expect(r.intent).toBe("emergency_red_flag");
    expect(r.isEmergency).toBe(true);
    expect(r.requiresHandoff).toBe(true);
  });

  it("detects emergency red flags — uncontrolled bleeding", () => {
    const r = detectIntent("There's uncontrolled bleeding after my extraction");
    expect(r.intent).toBe("emergency_red_flag");
    expect(r.isEmergency).toBe(true);
  });

  it("detects clinical questions and requires handoff (never diagnoses)", () => {
    const r = detectIntent("Can you tell me what's causing my tooth pain? Is it a cavity?");
    expect(r.intent).toBe("clinical_question");
    expect(r.requiresHandoff).toBe(true);
  });

  it("detects cancellation", () => {
    const r = detectIntent("I need to cancel my appointment");
    expect(r.intent).toBe("cancellation");
  });

  it("detects insurance question", () => {
    const r = detectIntent("Do you accept my insurance? I'm with Star Health.");
    expect(r.intent).toBe("insurance_question");
  });

  it("detects pricing question", () => {
    const r = detectIntent("How much does a cleaning cost?");
    expect(r.intent).toBe("pricing_question");
  });

  it("detects whitening", () => {
    const r = detectIntent("I'm interested in teeth whitening");
    expect(r.intent).toBe("whitening");
  });

  it("detects Invisalign", () => {
    const r = detectIntent("Do you do Invisalign?");
    expect(r.intent).toBe("invisalign");
  });

  it("detects request for human", () => {
    const r = detectIntent("I want to speak to a real person");
    expect(r.intent).toBe("request_human");
    expect(r.requiresHandoff).toBe(true);
  });

  it("detects angry patient", () => {
    const r = detectIntent("This is the second time you've cancelled on me, it's ridiculous!");
    expect(r.intent).toBe("angry_patient");
    expect(r.requiresHandoff).toBe(true);
  });

  it("falls back to general", () => {
    const r = detectIntent("Hello, how are you?");
    expect(r.intent).toBe("general");
  });
});

describe("generateDentalAIResponse", () => {
  it("returns a simulated response with citations", () => {
    const r = generateDentalAIResponse("How much is a cleaning?", "phone", "Aarav Patel");
    expect(r.simulated).toBe(true);
    expect(r.citations.length).toBeGreaterThan(0);
    expect(r.intent).toBe("pricing_question");
  });

  it("triggers emergency escalation for red flags", () => {
    const r = generateDentalAIResponse("I have severe facial swelling", "phone", "Test Patient");
    expect(r.isEmergency).toBe(true);
    expect(r.handoff).toBe(true);
    expect(r.text).toContain("emergency");
  });

  it("hands off clinical questions without diagnosing", () => {
    const r = generateDentalAIResponse("What's causing my tooth pain? Could it be an infection?", "phone", "Test");
    expect(r.intent).toBe("clinical_question");
    expect(r.handoff).toBe(true);
    expect(r.text).not.toContain("diagnos");
    expect(r.text).toContain("clinical");
  });

  it("requires approval for cancellation", () => {
    const r = generateDentalAIResponse("I need to cancel", "email", "Test");
    expect(r.approvalRequired).toBe(true);
  });

  it("labels every response as simulated", () => {
    const intents = ["new_patient_booking", "pricing_question", "tooth_pain", "cancellation", "angry_patient"];
    intents.forEach((msg) => {
      const text = msg === "new_patient_booking" ? "new patient book" : msg === "pricing_question" ? "how much" : msg === "tooth_pain" ? "tooth pain" : msg === "cancellation" ? "cancel" : "terrible";
      const r = generateDentalAIResponse(text, "phone", "Test");
      expect(r.simulated).toBe(true);
    });
  });

  it("never diagnoses conditions", () => {
    const clinicalQuestions = [
      "Is it a cavity?",
      "Do I need a root canal?",
      "Could it be an abscess?",
      "What's wrong with my tooth?",
    ];
    clinicalQuestions.forEach((q) => {
      const r = generateDentalAIResponse(q, "phone", "Test");
      expect(r.text.toLowerCase()).not.toContain("you have");
      expect(r.text.toLowerCase()).not.toContain("it is a");
      expect(r.handoff).toBe(true);
    });
  });
});

describe("text transforms", () => {
  it("rewrites text", () => {
    const result = rewriteText("Hi there! thx for the message!");
    expect(result).toContain("Hello");
    expect(result).toContain("thank you");
  });

  it("shortens text to first 2 sentences", () => {
    const text = "First sentence. Second sentence. Third sentence.";
    expect(shortenText(text)).toBe("First sentence. Second sentence.");
  });

  it("makes text friendlier", () => {
    const result = makeFriendlier("Hello. Regards.");
    expect(result).toContain("Hi there");
  });

  it("makes text more formal", () => {
    const result = makeMoreFormal("Hi! thx!");
    expect(result).toContain("Dear");
  });
});

describe("ROI calculator", () => {
  it("calculates revenue at risk from missed calls", () => {
    const r = calculateROI({
      monthlyCalls: 500,
      missedCallPct: 30,
      qualifiedBookPct: 40,
      avgPatientValue: 800,
      monthlyCancellations: 20,
      avgApptValue: 150,
      recallDuePerMonth: 50,
      frontDeskHours: 80,
    });
    expect(r.newPatientRevenueAtRisk).toBe(48000); // 500 * 0.3 * 0.4 * 800
    expect(r.cancellationRevenueAtRisk).toBe(3000); // 20 * 150
    expect(r.totalOpportunity).toBeGreaterThan(50000);
    expect(r.suggestedPlan).toBe("Group");
  });

  it("suggests Practice plan for mid-range opportunity", () => {
    const r = calculateROI({
      monthlyCalls: 300,
      missedCallPct: 30,
      qualifiedBookPct: 40,
      avgPatientValue: 700,
      monthlyCancellations: 15,
      avgApptValue: 150,
      recallDuePerMonth: 40,
      frontDeskHours: 60,
    });
    expect(r.totalOpportunity).toBeGreaterThan(15000);
    expect(r.suggestedPlan).toBe("Practice");
  });

  it("suggests After Hours plan for low opportunity", () => {
    const r = calculateROI({
      monthlyCalls: 100,
      missedCallPct: 20,
      qualifiedBookPct: 25,
      avgPatientValue: 400,
      monthlyCancellations: 5,
      avgApptValue: 100,
      recallDuePerMonth: 15,
      frontDeskHours: 20,
    });
    expect(r.totalOpportunity).toBeLessThan(15000);
    expect(r.suggestedPlan).toBe("After Hours");
  });
});
