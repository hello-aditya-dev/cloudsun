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

export interface AppointmentRepository {
  list(): Appointment[];
  save(appointment: Appointment): void;
  remove(id: string): void;
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

class DemoAppointmentRepository implements AppointmentRepository {
  list() { return getDemoState().appointments; }
  save(appointment: Appointment) {
    setDemoState((s) => {
      const exists = s.appointments.some((a) => a.id === appointment.id);
      return {
        ...s,
        appointments: exists
          ? s.appointments.map((a) => (a.id === appointment.id ? appointment : a))
          : [...s.appointments, appointment],
      };
    });
  }
  remove(id: string) {
    setDemoState((s) => ({ ...s, appointments: s.appointments.filter((a) => a.id !== id) }));
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
export const demoAppointments = new DemoAppointmentRepository();
export const demoIntegrations = new DemoIntegrationRepository();
export const demoAutomations = new DemoAutomationRepository();
export const demoKnowledge = new DemoKnowledgeRepository();
export const demoAudit = new DemoAuditRepository();
export const demoAIConfig = new DemoAIConfigRepository();
export const demoWorkspace = new DemoWorkspaceRepositoryImpl();
