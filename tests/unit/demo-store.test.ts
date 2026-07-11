import { describe, it, expect, beforeEach } from "vitest";
import { getDemoState, resetDemoWorkspace, setDemoState } from "@/lib/demo-store";

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
