# CloudSun

> Every client conversation. One intelligent front desk.

CloudSun is an omnichannel AI front desk and shared client inbox for phone calls, email, WhatsApp, website chat and appointment scheduling. A customer may begin through a phone call, continue over WhatsApp and later reply by email — CloudSun preserves those interactions as one continuous customer relationship.

**Repository:** [hello-aditya-dev/cloudsun](https://github.com/hello-aditya-dev/cloudsun)

**Current state:** Interactive product prototype with real Next.js App Router routes, persistent demo state, and an honest demo-mode system. No real provider integrations are connected.

---

## Product overview

CloudSun combines:

- A shared inbox across phone, email, WhatsApp and website chat
- An AI receptionist that answers, transcribes, routes and books (simulated)
- A lightweight CRM built around conversations
- A call workspace with live transcripts and after-call summaries (simulated telephony)
- An appointment scheduler that respects working hours and buffers
- An automation builder with triggers, conditions, AI steps and approvals
- A customer-intelligence dashboard

The product runs in **demo mode** by default. Every channel and integration status is honestly labelled. Nothing is marked "connected" without credentials and a successful health check.

---

## Architecture

CloudSun is a Next.js 16 App Router application. The previous single-page state machine has been replaced with real routes.

```
src/app/
  (marketing)/          Marketing website (route group, URL: /)
    page.tsx             Homepage
  (auth)/                Authentication screens (route group)
    login/page.tsx       /login
    signup/page.tsx      /signup
    forgot-password/     /forgot-password
  onboarding/            7-step guided setup
    page.tsx             /onboarding
    business/            /onboarding/business
    channels/            /onboarding/channels
    knowledge/           /onboarding/knowledge
    agent/               /onboarding/agent
    availability/        /onboarding/availability
    test/                /onboarding/test
    complete/            /onboarding/complete
  app/                   Application dashboard
    layout.tsx           AppShell (sidebar, topbar, mobile nav)
    page.tsx             /app (Overview)
    inbox/               /app/inbox and /app/inbox/[conversationId]
    calls/               /app/calls and /app/calls/[callId]
    contacts/            /app/contacts and /app/contacts/[contactId]
    calendar/            /app/calendar
    ai-agent/            /app/ai-agent
    knowledge/           /app/knowledge
    automations/         /app/automations
    analytics/           /app/analytics
    team/                /app/team
    integrations/        /app/integrations
    settings/            /app/settings
    billing/             /app/billing
    audit-log/           /app/audit-log
    loading.tsx          Route-level loading state
    error.tsx            Route-level error boundary
    not-found.tsx        404 for /app/*
```

### Demo persistence

All demo mutations go through a repository layer backed by `localStorage`:

```
src/lib/
  demo-store.ts          localStorage-backed state with subscribe/reset
  repositories.ts        Repository interfaces + demo implementations
  demo-ai.ts             Deterministic simulated AI response engine
src/hooks/
  use-demo-state.ts      React hook subscribing to demo state
```

The following actions survive a page refresh in demo mode:

- Sent messages and internal notes
- Conversation status, priority, assignee, snooze state
- Read / unread state
- AI configuration (draft and published)
- Integration demo connection status
- Automation enabled state
- Audit log entries

A **Reset demonstration workspace** action is available in the demo store (`resetDemoWorkspace()`).

### Production adapter

In production, swap the demo repositories for Prisma repositories that implement the same interfaces. The Prisma schema (`prisma/schema.prisma`) targets PostgreSQL and defines the full production data model: Workspace, WorkspaceMembership, User, Team, TeamMember, Contact, ContactIdentity, Company, Conversation, Message, Attachment, Call, CallTranscriptSegment, Appointment, AvailabilityRule, KnowledgeSource, KnowledgeDocument, AIConfiguration, AIVersion, AIAction, Handoff, Automation, AutomationStep, AutomationRun, Integration, UsageRecord, Notification, AuditLog.

The frontend does not require a database to run in demo mode.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Marketing homepage |
| `/login`, `/signup`, `/forgot-password` | Authentication (demo mode) |
| `/onboarding` → `/onboarding/complete` | 7-step guided setup |
| `/app` | Dashboard overview |
| `/app/inbox`, `/app/inbox/[conversationId]` | Unified inbox with shareable conversation URLs |
| `/app/calls`, `/app/calls/[callId]` | Calls list and detail with shareable URLs |
| `/app/contacts`, `/app/contacts/[contactId]` | Contacts CRM with shareable profile URLs |
| `/app/calendar` | Calendar (day, week, agenda) |
| `/app/ai-agent` | AI front desk builder with test playground |
| `/app/knowledge` | Knowledge base with test-question feature |
| `/app/automations` | Automation builder and activity history |
| `/app/analytics` | Analytics dashboard |
| `/app/team` | Team management and roles |
| `/app/integrations` | Integration catalog with status |
| `/app/settings` | Workspace, channels, notifications, security |
| `/app/billing` | Plan, usage, invoices (demonstration) |
| `/app/audit-log` | Audit log (human + AI + system actions) |

Deep links survive refresh. Browser Back and Forward work. Selected conversations, calls and contacts have shareable URLs.

---

## Demo-mode explanation

CloudSun ships in demo mode. This means:

- **Phone calls** use simulated telephony, clearly labelled "Demo telephony".
- **Email, WhatsApp, calendar** use typed mock adapters — status is "Provider not connected" until credentials exist.
- **AI responses** are generated by a deterministic simulation engine (`src/lib/demo-ai.ts`) that detects intent (pricing, booking, rescheduling, cancellation, project-status, request-human, angry-customer, unsupported, after-hours, general) and returns a labelled simulated response with citations and confidence.
- **Website chat** runs as an interactive demo.
- All conversation, contact, call and appointment data is seeded demonstration data for a fictional business ("Atelier North").
- **No fake "live" success messages** are displayed. Every simulated response is labelled "Simulated".

The UI is fully interactive. Every adapter has a clean interface ready to swap in a real provider.

---

## Local persistence explanation

Demo state is stored in `localStorage` under the key `cloudsun.demo.v1`. On first load, the seeded state is written. On subsequent loads, the stored state is used. The `useDemoState()` hook subscribes components to state changes via a custom event.

To reset: call `resetDemoWorkspace()` (available via the repository layer) or clear `localStorage` in your browser devtools.

---

## Setup

### Prerequisites

- Node.js 18+ or Bun
- A terminal (PowerShell 5.1 on Windows, any shell on macOS / Linux)

### Install and run

```bash
git clone https://github.com/hello-aditya-dev/cloudsun.git
cd cloudsun
bun install
cp .env.example .env
bun run dev
```

Open `http://localhost:3000` in your browser.

### Windows PowerShell 5.1

```powershell
git clone https://github.com/hello-aditya-dev/cloudsun.git
cd cloudsun
bun install
Copy-Item .env.example .env
bun run dev
```

---

## Environment variables

See `.env.example`. The application runs in demo mode without any credentials. Connect real credentials only when you are ready to go live. Never commit real secrets. Never expose server secrets through `NEXT_PUBLIC_` variables.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL |
| `AUTH_SECRET` | NextAuth secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (Gmail, Calendar, Meet, Drive) |
| `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET` | Microsoft OAuth (Outlook, Calendar, Teams) |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` / `WHATSAPP_VERIFY_TOKEN` | WhatsApp Business API |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` | Twilio telephony |
| `NOTION_CLIENT_ID` / `NOTION_CLIENT_SECRET` | Notion OAuth |
| `AI_PROVIDER_API_KEY` | AI provider key (for real AI responses) |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | Storage (recordings, attachments) |
| `SENTRY_DSN` | Error monitoring |

---

## Scripts

All scripts are cross-platform (Windows PowerShell 5.1, macOS, Linux, Vercel). No bash-only redirections or `tee`/`cp`/`rm` are used inside package scripts.

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `bun run dev` | Start dev server on port 3000 |
| `build` | `bun run build` | Production build |
| `start` | `bun run start` | Start production server |
| `lint` | `bun run lint` | ESLint |
| `typecheck` | `bun run typecheck` | TypeScript without emitting |
| `test` | `bun run test` | Vitest unit tests |
| `test:watch` | `bun run test:watch` | Vitest in watch mode |
| `test:e2e` | `bun run test:e2e` | Playwright end-to-end tests |
| `test:a11y` | `bun run test:a11y` | Playwright accessibility tests |
| `db:push` | `bun run db:push` | Push Prisma schema to database |
| `db:generate` | `bun run db:generate` | Generate Prisma client |
| `db:migrate` | `bun run db:migrate` | Create and apply a Prisma migration |
| `db:reset` | `bun run db:reset` | Reset the database |

---

## Testing

### Commands

```bash
bun run lint         # ESLint — passes clean
bun run typecheck    # TypeScript strict — passes clean
bun run test         # Vitest unit tests — 22 tests, all pass
bun run test:e2e     # Playwright e2e tests — 5 tests, all pass
bun run build        # Production build — passes, 30 routes
```

### Test coverage

**Unit tests** (`tests/unit/`):
- `demo-ai.test.ts` — intent detection (9 intents), AI response generation, text transforms (rewrite, shorten, friendlier, formal). 17 tests.
- `demo-store.test.ts` — demo state seeding, persistence, reset, AI config defaults, audit log growth. 5 tests.

**End-to-end tests** (`tests/e2e/flows.spec.ts`):
- Marketing → signup → onboarding → dashboard navigation flow
- Inbox: open and select a conversation
- Deep link to a conversation survives refresh
- Browser Back and Forward navigation
- Every sidebar item navigates to a real route (13 routes checked)

### Exact commands executed during development

```bash
bun install
bun run lint
bun run typecheck
bun run test
bun run test:e2e
bun run build
npx playwright install chromium
```

### Test results

- **Lint:** 0 errors, 0 warnings
- **Typecheck:** 0 errors (strict mode, `ignoreBuildErrors` removed)
- **Unit tests:** 22 passed, 0 failed
- **E2e tests:** 5 passed, 0 failed
- **Production build:** Compiled successfully, 30 routes generated

---

## Deployment

CloudSun is a standard Next.js application and deploys to any Node.js-compatible host (Vercel, Netlify, Railway, Fly.io, a VPS). Set the environment variables from `.env.example` on your host, then:

```bash
bun run build
bun run start
```

On Vercel, the build works out of the box — no special configuration needed.

---

## Security

### Production headers

The following security headers are set in `next.config.ts`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()`
- `Content-Security-Policy` (scoped to self, inline scripts/styles for Next.js, Google Fonts)
- `Frame-ancestors: 'self'`

### Honest security labels

The Settings → Security tab does not display switches as active production controls unless they are implemented:

- Two-factor authentication → "Requires authentication integration"
- Single sign-on (SSO) → "Requires Organization plan"
- IP allowlist → "Placeholder"
- PII masking → "Demonstration setting"
- Webhook signing → "Demonstration setting"

### Other

- `reactStrictMode` is enabled.
- `typescript.ignoreBuildErrors` is removed — the build fails on type errors.
- All forms are validated with Zod (available; demo forms use native validation).
- No unsafe HTML rendering (`dangerouslySetInnerHTML` removed from product copy).
- Confirmation dialogs are used for destructive actions (reset demo workspace, disconnect integration).
- Secrets are never committed. `.gitignore` excludes `.env*` (except `.env.example`).

---

## Current limitations

- **Telephony, email, WhatsApp, calendar** run in demo mode. Production credentials are required for live channels.
- **AI responses** are simulated by a deterministic engine. A production AI provider key is required for real AI behaviour.
- **Authentication** screens exist but are not wired to a real identity provider. "Sign in" enters the demo workspace without verifying credentials.
- **Website chat widget** is a demonstration view, not an embeddable production snippet.
- **Database persistence** is not enabled; all data is seeded in memory and persisted to `localStorage` in demo mode.
- **Payment processing** does not exist. The "Manage plan" button is disabled. Invoices are labelled "demonstration".

---

## Production roadmap

1. Wire authentication with NextAuth.js and a real identity provider.
2. Connect Gmail / Outlook, WhatsApp Business, Twilio and Google / Microsoft Calendar.
3. Connect a production AI provider for live agent behaviour.
4. Enable Prisma persistence for conversations, contacts, calls, appointments and audit logs.
5. Build the embeddable website-chat widget as a standalone bundle.
6. Add automated unit, integration and accessibility test coverage for every component.
7. Deploy to production with monitoring and error reporting.

---

## Contribution and ownership

CloudSun is owned and maintained by [hello-aditya-dev](https://github.com/hello-aditya-dev). Contributions are welcome via pull request. Please do not attribute commits to bots, assistants or generated authors.

## Demo data notice

All customer names, companies, phone numbers, email addresses and conversation content in this repository are fictional and belong to a demonstration business ("Atelier North"). No real customer data is included.
