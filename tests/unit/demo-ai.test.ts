import { describe, it, expect } from "vitest";
import {
  detectIntent,
  generateDemoAIResponse,
  rewriteText,
  shortenText,
  makeFriendlier,
  makeMoreFormal,
} from "@/lib/demo-ai";

describe("detectIntent", () => {
  it("detects pricing intent", () => {
    const r = detectIntent("How much does a consultation cost?");
    expect(r.intent).toBe("pricing");
    expect(r.confidence).toBeGreaterThan(0.7);
  });

  it("detects booking intent", () => {
    const r = detectIntent("I'd like to book an appointment for next Tuesday");
    expect(r.intent).toBe("booking");
  });

  it("detects rescheduling intent", () => {
    const r = detectIntent("Can I reschedule my session to a different time?");
    expect(r.intent).toBe("rescheduling");
  });

  it("detects cancellation intent", () => {
    const r = detectIntent("I need to cancel my appointment and get a refund");
    expect(r.intent).toBe("cancellation");
  });

  it("detects request for human", () => {
    const r = detectIntent("I want to speak to a real person please");
    expect(r.intent).toBe("request_human");
  });

  it("detects angry customer even with other keywords", () => {
    const r = detectIntent("This is the second time you've messed up my booking, unacceptable!");
    expect(r.intent).toBe("angry_customer");
  });

  it("detects unsupported topics", () => {
    const r = detectIntent("Can you give me legal advice about my contract?");
    expect(r.intent).toBe("unsupported");
  });

  it("falls back to general for unmatched", () => {
    const r = detectIntent("Hello, how are you today?");
    expect(r.intent).toBe("general");
  });
});

describe("generateDemoAIResponse", () => {
  it("returns a simulated response with citations", () => {
    const r = generateDemoAIResponse("How much is a consultation?", "phone", "Meera Krishnan");
    expect(r.simulated).toBe(true);
    expect(r.citations.length).toBeGreaterThan(0);
    expect(r.text).toContain("Meera");
    expect(r.intent).toBe("pricing");
  });

  it("triggers handoff for angry customers", () => {
    const r = generateDemoAIResponse("This is terrible and unacceptable!", "phone", "Saanvi Patel");
    expect(r.handoff).toBe(true);
    expect(r.intent).toBe("angry_customer");
  });

  it("requires approval for cancellation", () => {
    const r = generateDemoAIResponse("I need to cancel my appointment", "email", "Daniel Okafor");
    expect(r.approvalRequired).toBe(true);
  });

  it("returns different responses for different intents", () => {
    const pricing = generateDemoAIResponse("How much?", "phone", "Test User");
    const booking = generateDemoAIResponse("I want to book", "phone", "Test User");
    expect(pricing.text).not.toBe(booking.text);
  });

  it("labels every response as simulated", () => {
    const intents = ["pricing", "booking", "rescheduling", "cancellation", "angry_customer"];
    intents.forEach((i) => {
      const msg = i === "pricing" ? "how much" : i === "booking" ? "book" : i === "rescheduling" ? "reschedule" : i === "cancellation" ? "cancel" : "terrible";
      const r = generateDemoAIResponse(msg, "phone", "Test");
      expect(r.simulated).toBe(true);
    });
  });
});

describe("text transforms", () => {
  it("rewrites text", () => {
    expect(rewriteText("Hi there! thx for the message!")).toBe("Hello there. thank you for the message.");
  });

  it("shortens text to first 2 sentences", () => {
    const text = "First sentence. Second sentence. Third sentence.";
    expect(shortenText(text)).toBe("First sentence. Second sentence.");
  });

  it("makes text friendlier", () => {
    const result = makeFriendlier("Hello. Regards.");
    expect(result).toContain("Hi there");
    expect(result).toContain("Warm regards");
  });

  it("makes text more formal", () => {
    const result = makeMoreFormal("Hi! thx!");
    expect(result).toContain("Dear");
    expect(result).toContain("thank you");
  });
});
