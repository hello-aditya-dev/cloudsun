import { describe, it, expect, beforeEach } from "vitest";
import { getDemoState, resetDemoWorkspace, setDemoState } from "@/lib/demo-store";
import { demoAIConfig } from "@/lib/repositories";

describe("demo store", () => {
  beforeEach(() => {
    resetDemoWorkspace();
  });

  it("starts with seeded conversations", () => {
    const state = getDemoState();
    expect(state.conversations.length).toBeGreaterThan(0);
  });

  it("persists a conversation update", () => {
    const initial = getDemoState();
    const firstId = initial.conversations[0].id;
    setDemoState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === firstId ? { ...c, status: "closed" } : c,
      ),
    }));
    const updated = getDemoState();
    expect(updated.conversations.find((c) => c.id === firstId)?.status).toBe("closed");
  });

  it("reset restores seeded state", () => {
    const initial = getDemoState();
    const firstId = initial.conversations[0].id;
    setDemoState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === firstId ? { ...c, status: "closed" } : c,
      ),
    }));
    expect(getDemoState().conversations.find((c) => c.id === firstId)?.status).toBe("closed");
    resetDemoWorkspace();
    expect(getDemoState().conversations.find((c) => c.id === firstId)?.status).not.toBe("closed");
  });

  it("starts with aiConfig default", () => {
    const state = getDemoState();
    expect(state.aiConfig.agentName).toBe("Sunny");
    expect(state.aiConfig.minConfidence).toBe(70);
  });

  it("aiConfig has expanded fields", () => {
    const config = demoAIConfig.get();
    expect(config.greeting).toBeTruthy();
    expect(config.closing).toBeTruthy();
    expect(config.toolPermissions).toBeDefined();
    expect(config.channelSettings).toBeDefined();
    expect(config.handoffRules.length).toBeGreaterThan(0);
    expect(config.emergencyRules.length).toBeGreaterThan(0);
    expect(config.newPatientQuestions.length).toBeGreaterThan(0);
    expect(config.pronunciationDict.length).toBeGreaterThan(0);
  });

  it("aiConfig update persists all fields", () => {
    demoAIConfig.update({
      agentName: "TestAgent",
      greeting: "Test greeting",
      minConfidence: 85,
      toolPermissions: { book_appointment: "approval" },
    });
    const updated = demoAIConfig.get();
    expect(updated.agentName).toBe("TestAgent");
    expect(updated.greeting).toBe("Test greeting");
    expect(updated.minConfidence).toBe(85);
    expect(updated.toolPermissions.book_appointment).toBe("approval");
  });

  it("aiConfig publish sets timestamp and increments version", () => {
    const before = demoAIConfig.get();
    const beforeVersion = before.draftVersion;
    demoAIConfig.update({ agentName: "PrePublish" });
    demoAIConfig.publish();
    const after = demoAIConfig.get();
    expect(after.publishedAt).toBeTruthy();
    expect(after.draftVersion).toBeGreaterThan(beforeVersion);
  });

  it("audit log grows on add", () => {
    const before = getDemoState().auditLog.length;
    setDemoState((s) => ({
      ...s,
      auditLog: [
        {
          id: `al_test_${Date.now()}`,
          actor: "Test",
          actorType: "system",
          action: "Test action",
          resource: "test",
          at: new Date().toISOString(),
          ip: "test",
          result: "success",
        },
        ...s.auditLog,
      ],
    }));
    expect(getDemoState().auditLog.length).toBe(before + 1);
  });
});
