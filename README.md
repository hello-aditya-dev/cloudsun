# CloudSun

> Every client conversation. One intelligent front desk.

CloudSun is an omnichannel AI front desk and shared client inbox for phone calls, email, WhatsApp, website chat and appointment scheduling. A customer may begin through a phone call, continue over WhatsApp and later reply by email — CloudSun preserves those interactions as one continuous customer relationship.

This repository contains the complete frontend product prototype: a marketing website, a guided onboarding flow, and a full application dashboard with a unified inbox, live-call workspace, lightweight CRM, calendar, AI front desk builder, knowledge base, automation builder, analytics, team management, integrations, settings, billing, security and audit log.

## Product positioning

CloudSun is designed for busy professional services — clinics, salons, studios, advisory firms — where the front desk is the difference between a booked client and a lost lead. It combines:

- A premium shared inbox across phone, email, WhatsApp and website chat
- An AI receptionist that answers, transcribes, routes and books
- A lightweight CRM built around conversations, not forms
- A call-management system with live transcripts and after-call summaries
- An appointment scheduler that reads real calendar availability
- An automation platform with triggers, conditions, AI steps and approvals
- A customer-intelligence dashboard with honest analytics

## Major features

- **Unified inbox** — three-panel desktop layout with status filters, channel filters, search, message threads (customer / AI / human / internal note / system event), composer with AI draft, rewrite, schedule send and request approval, and a context panel with contact details, AI summary and suggested next action.
- **Phone and call experience** — live-call workspace with transcript, waveform, AI listening / speaking / confidence indicators, mute / hold / transfer / add human / end controls, tool-activity feed, and after-call recording, summary, topics, follow-ups and quality flags.
- **Contacts and CRM** — list with lead-stage filters, profile with connected identities, ownership, AI summary, unified timeline, consent history, data export and deletion requests, and safe identity merge.
- **Calendar and scheduling** — day, week and agenda views, appointment detail with source, channel and assignee, working hours, buffers, blackout dates and booking types.
- **AI front desk builder** — identity, behaviour rules, per-channel settings, a four-level tool-permission model (disabled / suggest / approval / execute), confidence and sentiment thresholds, escalation rules, voice configuration and an interactive test playground.
- **Knowledge base** — website, sitemap, URL, PDF, document, text, FAQ, Notion, Google Drive and manual sources, with coverage report, conflicting-answer detection, frequently unanswered questions and citations on every AI answer.
- **Automations** — trigger / condition / AI step / action / delay / branch / approval flows with activity history and enable / disable toggles.
- **Analytics** — conversation volume, channel mix, first-response time, resolution time, AI-handled rate, revenue influenced, team workload and cost per conversation, with date-range filters and comparison periods.
- **Team and permissions** — owner, administrator, manager, agent, analyst and read-only roles, with availability, capacity, skills, languages and assignment rules.
- **Integrations** — Gmail, Outlook, WhatsApp Business, website chat, Twilio, Google Calendar, Microsoft Calendar, Notion, Zoom, Google Meet, Teams, HubSpot, Salesforce, Pipedrive, Webhooks, Zapier, REST API and Google Drive, each with honest status (not connected, connecting, connected, reauthorization required, permission missing, sync delayed, error, disabled).
- **Security and audit** — two-factor authentication, active sessions, SSO placeholder, role-based permissions, data retention, call-recording retention, PII masking, IP allowlist placeholder, webhook signing, and a full audit log covering both human and AI actions.
- **Onboarding** — a seven-step guided setup: business, channels, knowledge, AI identity, availability, test and completion, with a readiness checklist that never claims the agent is live if integrations are missing.

## Route map

The prototype runs on a single `/` route (a client-side state machine) so it can be previewed in restricted environments. The full route map, ready to be split into separate Next.js App Router segments, is:

```
/                        Marketing homepage
/onboarding              Onboarding flow (7 steps)
/app                     Application shell
/app/inbox               Unified inbox
/app/calls               Calls list and live workspace
/app/contacts            Contacts CRM
/app/calendar            Calendar
/app/ai-agent            AI front desk builder
/app/knowledge           Knowledge base
/app/automations         Automation builder
/app/analytics           Analytics
/app/team                Team management
/app/integrations        Integrations
/app/settings            Settings (general, channels, notifications, security)
/app/billing             Billing
/app/audit-log           Audit log
```

## Technology stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui component library
- **UI components**: Complete shadcn/ui set (New York style) with Lucide icons
- **Animation**: Framer Motion patterns and custom CSS keyframes
- **State**: React hooks and Zustand-ready architecture
- **Server state**: TanStack Query (available)
- **Tables**: TanStack Table (available)
- **Forms**: React Hook Form + Zod (available)
- **Charts**: Custom SVG and CSS-based charts (Recharts available)
- **Database**: Prisma ORM (SQLite client) — available when needed
- **Authentication**: NextAuth.js v4 — available when needed

## Architecture overview

```
src/
  app/                    Next.js App Router entry (layout, page, globals)
  components/
    cloudsun/
      marketing/          Marketing website components
      app/                Application shell and section screens
        sections/         One file per dashboard section
      shared/             Logo, channel helpers, icon resolver, formatters
    ui/                   shadcn/ui component library
  config/
    cloudsun.ts           Central product identity, navigation, channels, pricing
  data/
    demo.ts               Realistic demonstration data and seeded records
  types/
    domain.ts             Strict TypeScript domain models
  lib/                    Utilities and database client
  hooks/                  Custom React hooks
```

The UI consumes typed domain models and adapter interfaces rather than depending directly on any vendor, so production integrations can be connected later without rewriting components.

## Data model overview

Strict TypeScript models are defined for: `Workspace`, `User`, `TeamMember`, `Role`, `Integration`, `Channel`, `Contact`, `ContactIdentity`, `Company`, `Conversation`, `Message`, `Attachment`, `Call`, `CallTranscriptSegment`, `Appointment`, `AvailabilityRule`, `KnowledgeSource`, `Automation`, `AutomationRun`, `AIConfiguration`, `AIResponse`, `AIAction`, `Handoff`, `UsageRecord`, `Notification` and `AuditLog`.

## Local installation

### Prerequisites

- Node.js 18+ or Bun
- A terminal (PowerShell 5.1 on Windows, any shell on macOS / Linux)

### Install and run

```bash
# Clone the repository
git clone https://github.com/hello-aditya-dev/cloudsun.git
cd cloudsun

# Install dependencies
bun install

# Copy the environment template
cp .env.example .env

# Start the development server
bun run dev
```

Open `http://localhost:3000` in your browser.

### Windows PowerShell 5.1 setup

```powershell
# Clone the repository
git clone https://github.com/hello-aditya-dev/cloudsun.git
cd cloudsun

# Install dependencies
bun install

# Copy the environment template
Copy-Item .env.example .env

# Start the development server
bun run dev
```

## Environment variables

See `.env.example` for the full list. The application runs in demo mode without any credentials — mock adapters keep every channel usable. Connect real credentials only when you are ready to go live.

## Demo mode explanation

CloudSun ships in demo mode. This means:

- Phone calls use simulated telephony, clearly labelled.
- Email, WhatsApp and calendar integrations use typed mock adapters.
- AI responses are simulated in the test playground.
- All conversation, contact, call and appointment data is seeded demonstration data for a fictional business ("Atelier North").
- Channel-health indicators show the real status of each integration.
- No fake "live" success messages are displayed.

Demo mode is not a limitation — it is honesty. The interface is fully explorable, and every adapter has a clean interface ready to swap in a real provider.

## Integration-adapter explanation

Each external provider (email, WhatsApp, voice, calendar, Notion, AI, storage) is accessed through a typed adapter interface. The UI consumes these interfaces rather than calling vendors directly, so connecting a production provider is a matter of implementing the interface — no component rewrites required. Mock adapters are used by default and keep the interface usable without credentials.

## Available scripts

```bash
bun run dev          # Start the development server on port 3000
bun run build        # Production build
bun run start        # Start the production server
bun run lint         # Run ESLint
bun run db:push      # Push the Prisma schema to the database
bun run db:generate  # Generate the Prisma client
bun run db:migrate   # Create and apply a Prisma migration
bun run db:reset     # Reset the database
```

## Testing

- **Lint**: `bun run lint` — passes clean with zero errors.
- **Type checking**: TypeScript strict mode, no errors.
- **Production build**: `bun run build` — compiles successfully.
- **Browser verification**: every route renders, every navigation item works, the inbox three-panel layout is interactive, the AI test playground responds to messages, and the knowledge base returns answers with citations.
- **Responsive**: tested at 1440px, 1280px, 1024px, 768px, 430px, 390px and 360px.

## Deployment

CloudSun is a standard Next.js application and deploys to any Node.js-compatible host (Vercel, Netlify, Railway, Fly.io, a VPS). Set the environment variables from `.env.example` on your host, then:

```bash
bun run build
bun run start
```

## Security considerations

- Never commit real secrets. The `.gitignore` excludes `.env*` files.
- Never expose server secrets through client environment variables.
- Secret tokens are never displayed after they have been saved in the integrations UI.
- Two-factor authentication is available for every team member.
- Role-based access controls cover conversations, call recordings, contact exports, AI settings, knowledge, integrations, billing and audit logs.
- PII masking and recording retention windows are configurable.
- The audit log retains every human and AI action.

## Current limitations

- Telephony, email, WhatsApp and calendar integrations run in demo mode. Production credentials are required for live channels.
- The AI agent uses simulated responses. A production AI provider key is required for live AI behaviour.
- Authentication screens exist in the prototype flow but are not wired to a real identity provider.
- The website chat widget is a demonstration view, not an embeddable production snippet.
- Database persistence is not enabled; all data is seeded in memory.

## Production roadmap

1. Wire authentication with NextAuth.js and a real identity provider.
2. Connect Gmail / Outlook, WhatsApp Business, Twilio and Google / Microsoft Calendar.
3. Connect a production AI provider for live agent behaviour.
4. Enable Prisma persistence for conversations, contacts, calls, appointments and audit logs.
5. Build the embeddable website-chat widget as a standalone bundle.
6. Add automated unit, integration and accessibility tests.
7. Deploy to production with monitoring and error reporting.

## Contribution and ownership

CloudSun is owned and maintained by its repository owner. Contributions are welcome via pull request. Please do not attribute commits to bots, assistants or generated authors.

## Demo data notice

All customer names, companies, phone numbers, email addresses and conversation content in this repository are fictional and belong to a demonstration business ("Atelier North"). No real customer data is included.
