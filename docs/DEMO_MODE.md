# CloudSun Dental — Demo Mode

## What is simulated

- **AI responses:** Deterministic simulation engine (`src/lib/demo-ai.ts`). No real AI model is called. 16 dental-specific intents with emergency screening and clinical-question handoff.
- **Telephony:** Demo telephony. No Twilio connected.
- **Email/WhatsApp/Calendar:** Typed mock adapters. Providers not connected.
- **Authentication:** Enters demo workspace without verifying credentials.
- **Payment processing:** Disabled.
- **All patient data:** Fictional (Lumen Dental Care).

## What persists

All demo mutations are saved to `localStorage` (key: `cloudsun.demo.dental.v2`):

- Sent messages and internal notes
- Conversation status, priority, assignee
- Recall case status and outreach
- Waitlist acceptance states
- Treatment follow-up stage transitions
- AI configuration (draft and published)
- Audit log entries

## Reset

Use Settings → General → Reset demonstration workspace. This clears localStorage and restores the original seeded state.

## What is NOT simulated (production requirements)

- Real AI provider (requires `AI_PROVIDER_API_KEY`)
- Real telephony (requires Twilio credentials)
- Real email/WhatsApp/calendar (requires OAuth credentials)
- Real authentication (requires NextAuth configuration)
- Real database (requires PostgreSQL + Prisma)
- Real payment processing
- Real healthcare compliance
