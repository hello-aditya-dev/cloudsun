/**
 * CloudSun Dental — central product configuration.
 * The product is now positioned for dental practices.
 */

export const product = {
  name: "CloudSun Dental",
  shortName: "CloudSun",
  tagline: "Fill your schedule without adding more pressure to your front desk.",
  altTagline: "Every patient conversation. One intelligent dental front desk.",
  supporting:
    "CloudSun Dental handles new-patient enquiries, appointment requests, missed calls, cancellations, recalls and routine questions — while your team stays in control.",
  eyebrow: "AI front desk for dental practices",
  category: "Dental AI Front Desk",
  repository: "hello-aditya-dev/cloudsun",
  authorIdentity: "hello-aditya-dev",
  description:
    "The AI-powered front desk for modern dental practices. Handles new-patient enquiries, appointment requests, cancellations, recalls and treatment follow-up.",
  email: "hello@cloudsun.dental",
  demoModeLabel: "Demo mode",
  currentYear: 2026,
  disclaimer:
    "CloudSun Dental is a front-desk communication system. It does not diagnose conditions or replace clinical judgement.",
  prototypeNotice:
    "CloudSun Dental is currently an interactive product prototype. Production healthcare deployments would require technical, contractual and legal controls appropriate to the customer's jurisdiction and systems.",
} as const;

/**
 * One truthful capability state model.
 * Nothing is marked "connected" without credentials and a successful health check.
 */
export type CapabilityState =
  | "demo"
  | "not_connected"
  | "connecting"
  | "connected"
  | "reauthorization_required"
  | "sync_delayed"
  | "error"
  | "disabled"
  | "planned";

export const capabilityLabel: Record<CapabilityState, string> = {
  demo: "Interactive demo",
  not_connected: "Provider not connected",
  connecting: "Connecting…",
  connected: "Connected",
  reauthorization_required: "Reauthorization required",
  sync_delayed: "Sync delayed",
  error: "Error",
  disabled: "Disabled",
  planned: "Planned",
};

export const capabilityColor: Record<CapabilityState, string> = {
  demo: "oklch(0.70 0.12 75)",
  not_connected: "oklch(0.5 0 0)",
  connecting: "oklch(0.70 0.12 75)",
  connected: "oklch(0.45 0.08 155)",
  reauthorization_required: "oklch(0.62 0.16 42)",
  sync_delayed: "oklch(0.70 0.12 75)",
  error: "oklch(0.62 0.16 42)",
  disabled: "oklch(0.5 0 0)",
  planned: "oklch(0.65 0.05 250)",
};

export interface CurrencyConfig {
  code: "USD";
  symbol: "$";
  locale: "en-US";
}

export const currency: CurrencyConfig = {
  code: "USD",
  symbol: "$",
  locale: "en-US",
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: 0,
  }).format(amount);
}

export type ChannelId = "phone" | "email" | "whatsapp" | "webchat";

export interface ChannelDef {
  id: ChannelId;
  label: string;
  short: string;
  color: string;
  dot: string;
  description: string;
}

export const channels: Record<ChannelId, ChannelDef> = {
  phone: {
    id: "phone",
    label: "Phone calls",
    short: "Phone",
    color: "oklch(0.62 0.16 42)",
    dot: "bg-[oklch(0.62_0.16_42)]",
    description: "AI answers, triages, and books appointments.",
  },
  email: {
    id: "email",
    label: "Email",
    short: "Email",
    color: "oklch(0.45 0.08 155)",
    dot: "bg-[oklch(0.45_0.08_155)]",
    description: "Drafts replies, triages enquiries, routes to staff.",
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    short: "WhatsApp",
    color: "oklch(0.55 0.14 150)",
    dot: "bg-[oklch(0.55_0.14_150)]",
    description: "Instant replies with templates and handoff.",
  },
  webchat: {
    id: "webchat",
    label: "Website chat",
    short: "Chat",
    color: "oklch(0.50 0.10 250)",
    dot: "bg-[oklch(0.50_0.10_250)]",
    description: "Embedded widget with live handoff.",
  },
};

export const channelList = Object.values(channels);

// ─── Dashboard navigation ──────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  group: "primary" | "secondary" | "dental";
  badge?: string;
}

export const appNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard", group: "primary" },
  { id: "inbox", label: "Inbox", icon: "Inbox", group: "primary", badge: "12" },
  { id: "calls", label: "Calls", icon: "Phone", group: "primary" },
  { id: "patients", label: "Patients & Leads", icon: "Users", group: "primary" },
  { id: "calendar", label: "Calendar", icon: "CalendarDays", group: "primary" },
  // Dental-specific modules
  { id: "recall", label: "Recall", icon: "RotateCw", group: "dental" },
  { id: "waitlist", label: "Waitlist", icon: "ListOrdered", group: "dental" },
  { id: "treatment-follow-up", label: "Treatment Follow-up", icon: "ClipboardList", group: "dental" },
  // Configuration
  { id: "ai-agent", label: "AI Front Desk", icon: "Sparkles", group: "primary" },
  { id: "knowledge", label: "Knowledge", icon: "BookOpen", group: "primary" },
  { id: "automations", label: "Automations", icon: "Workflow", group: "primary" },
  { id: "analytics", label: "Analytics", icon: "BarChart3", group: "primary" },
  // Manage
  { id: "team", label: "Team", icon: "UserCog", group: "secondary" },
  { id: "integrations", label: "Integrations", icon: "Plug", group: "secondary" },
  { id: "settings", label: "Settings", icon: "Settings", group: "secondary" },
  { id: "billing", label: "Billing", icon: "CreditCard", group: "secondary" },
  { id: "audit-log", label: "Audit log", icon: "ShieldCheck", group: "secondary" },
];

export const marketingNav = [
  { label: "Product", href: "/product" },
  { label: "Solutions", href: "/solutions/new-patient-intake" },
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "/security" },
  { label: "Integrations", href: "/integrations" },
];

// ─── Dental pricing ─────────────────────────────────────────────────────────

export const pricingTiers = [
  {
    name: "After Hours",
    price: "$349",
    cadence: "/month",
    summary: "For practices that want overflow and after-hours enquiry handling.",
    features: [
      "One practice location",
      "One demonstration front-desk agent",
      "After-hours and overflow workflows",
      "New-patient lead capture",
      "Missed-call follow-up simulation",
      "Website chat",
      "Appointment-request intake",
      "Shared inbox for 3 staff members",
      "Basic reporting",
      "Defined monthly usage allowance",
    ],
    cta: "Start a controlled pilot",
    highlighted: false,
  },
  {
    name: "Practice",
    price: "$899",
    cadence: "/month",
    summary: "For busy single-location practices.",
    features: [
      "Full-day enquiry handling",
      "New-patient intake",
      "Appointment booking and rescheduling workflows",
      "Cancellation recovery",
      "Waitlist",
      "Recall and reactivation",
      "Treatment follow-up",
      "Phone, email, WhatsApp and website-chat interface",
      "Up to 10 team members",
      "Advanced reporting",
      "Multiple dental front-desk workflows",
      "Priority implementation support",
      "Defined monthly usage allowance",
    ],
    cta: "Book a dental workflow review",
    highlighted: true,
  },
  {
    name: "Group",
    price: "Custom",
    cadence: "",
    summary: "For multi-location practices, dental groups and DSOs.",
    features: [
      "Multi-location practices",
      "Dental groups and DSOs",
      "Centralized teams",
      "Custom permissions",
      "Multiple practice-management systems",
      "Custom reporting",
      "Enterprise security requirements",
      "Dedicated implementation",
      "Custom retention",
      "Volume pricing",
    ],
    cta: "Talk to us",
    highlighted: false,
  },
];

export const implementationNote =
  "Implementation and onboarding priced separately. Example implementation range: from $750, depending on locations, workflows and migration requirements.";

export const pricingDisclaimer =
  "Proposed product pricing. CloudSun Dental is not yet commercially available. Payment processing is not live.";

// ─── Dental appointment types ───────────────────────────────────────────────

export interface AppointmentType {
  id: string;
  name: string;
  duration: number; // minutes
  buffer: number;
  providerType: "dentist" | "hygienist" | "either";
  patientType: "new" | "existing" | "both";
  requiresApproval: boolean;
  onlineBooking: boolean;
  depositRequired: boolean;
  instructions?: string;
}

export const appointmentTypes: AppointmentType[] = [
  { id: "new-patient-exam", name: "New-patient examination", duration: 45, buffer: 10, providerType: "dentist", patientType: "new", requiresApproval: false, onlineBooking: true, depositRequired: false, instructions: "Please arrive 10 minutes early to complete new-patient forms." },
  { id: "hygiene-cleaning", name: "Hygiene cleaning", duration: 60, buffer: 5, providerType: "hygienist", patientType: "both", requiresApproval: false, onlineBooking: true, depositRequired: false },
  { id: "emergency-exam", name: "Emergency examination", duration: 30, buffer: 10, providerType: "dentist", patientType: "both", requiresApproval: true, onlineBooking: false, depositRequired: false, instructions: "Same-day or next-day priority scheduling." },
  { id: "consultation", name: "Consultation", duration: 30, buffer: 5, providerType: "dentist", patientType: "both", requiresApproval: false, onlineBooking: true, depositRequired: false },
  { id: "implant-consultation", name: "Implant consultation", duration: 45, buffer: 10, providerType: "dentist", patientType: "both", requiresApproval: true, onlineBooking: true, depositRequired: false },
  { id: "invisalign-consultation", name: "Invisalign / orthodontic consultation", duration: 60, buffer: 10, providerType: "dentist", patientType: "both", requiresApproval: true, onlineBooking: true, depositRequired: false },
  { id: "cosmetic-consultation", name: "Cosmetic consultation", duration: 45, buffer: 10, providerType: "dentist", patientType: "both", requiresApproval: true, onlineBooking: true, depositRequired: false },
  { id: "whitening", name: "Whitening", duration: 90, buffer: 10, providerType: "either", patientType: "existing", requiresApproval: false, onlineBooking: true, depositRequired: true },
  { id: "existing-patient-exam", name: "Existing-patient examination", duration: 30, buffer: 5, providerType: "dentist", patientType: "existing", requiresApproval: false, onlineBooking: true, depositRequired: false },
  { id: "treatment-appointment", name: "Treatment appointment", duration: 90, buffer: 15, providerType: "dentist", patientType: "existing", requiresApproval: true, onlineBooking: false, depositRequired: true },
  { id: "post-op-review", name: "Post-operative review", duration: 20, buffer: 5, providerType: "dentist", patientType: "existing", requiresApproval: false, onlineBooking: false, depositRequired: false },
];

// ─── Emergency red flags ─────────────────────────────────────────────────────

export const emergencyRedFlags = [
  "difficulty breathing",
  "uncontrolled bleeding",
  "severe facial swelling",
  "major facial trauma",
  "loss of consciousness",
  "suspected medical emergency",
];

export const emergencyResponse =
  "This sounds like it may need urgent clinical attention. If you are experiencing severe swelling, uncontrolled bleeding, difficulty breathing, or a serious injury, please contact your nearest emergency services or go to the nearest hospital emergency department immediately. I'm also notifying our on-call team member right now.";

// ─── Dental integrations ─────────────────────────────────────────────────────

export const integrationCatalog = [
  // Dental practice-management systems
  { name: "Dentrix", category: "Practice Management", status: "planned" as const, icon: "Database" },
  { name: "Open Dental", category: "Practice Management", status: "planned" as const, icon: "Database" },
  { name: "Eaglesoft", category: "Practice Management", status: "planned" as const, icon: "Database" },
  { name: "Curve Dental", category: "Practice Management", status: "planned" as const, icon: "Database" },
  { name: "CareStack", category: "Practice Management", status: "planned" as const, icon: "Database" },
  { name: "Denticon", category: "Practice Management", status: "planned" as const, icon: "Database" },
  // Communication
  { name: "Twilio telephony", category: "Communication", status: "available" as const, icon: "Phone" },
  { name: "Gmail", category: "Communication", status: "available" as const, icon: "Mail" },
  { name: "Microsoft Outlook", category: "Communication", status: "available" as const, icon: "Mail" },
  { name: "WhatsApp Business", category: "Communication", status: "available" as const, icon: "MessageCircle" },
  { name: "Website chat widget", category: "Communication", status: "available" as const, icon: "MessageSquare" },
  { name: "SMS provider", category: "Communication", status: "planned" as const, icon: "MessageSquare" },
  // Calendar
  { name: "Google Calendar", category: "Calendar", status: "available" as const, icon: "Calendar" },
  { name: "Microsoft Calendar", category: "Calendar", status: "available" as const, icon: "Calendar" },
  { name: "Google Meet", category: "Meetings", status: "available" as const, icon: "Video" },
  { name: "Zoom", category: "Meetings", status: "available" as const, icon: "Video" },
  // Payments and forms
  { name: "Payment provider", category: "Payments", status: "planned" as const, icon: "CreditCard" },
  { name: "Financing provider", category: "Payments", status: "planned" as const, icon: "CreditCard" },
  { name: "Patient forms", category: "Payments", status: "planned" as const, icon: "FileText" },
  // Automation
  { name: "Zapier", category: "Automation", status: "available" as const, icon: "Zap" },
  { name: "Webhooks", category: "Automation", status: "available" as const, icon: "Webhook" },
  { name: "REST API", category: "Automation", status: "available" as const, icon: "Code" },
] as const;

export const featureFlags = {
  liveTelephony: false,
  liveEmail: false,
  liveWhatsApp: false,
  liveWebchat: false,
  liveCalendar: false,
  liveAi: false,
  sso: false,
  hipaaCompliant: false,
  soc2Compliant: false,
} as const;

// ─── Dental solution pages ──────────────────────────────────────────────────

export const solutions = [
  {
    slug: "new-patient-intake",
    title: "New-patient intake",
    description: "Capture every new-patient enquiry and convert more to booked appointments.",
    icon: "UserPlus",
  },
  {
    slug: "after-hours",
    title: "After-hours coverage",
    description: "Never miss an enquiry because your front desk is closed or busy.",
    icon: "Moon",
  },
  {
    slug: "cancellations",
    title: "Cancellation recovery",
    description: "Fill cancelled slots automatically with waitlist patients.",
    icon: "CalendarX",
  },
  {
    slug: "recall",
    title: "Recall and reactivation",
    description: "Bring due and overdue patients back with approved reminder sequences.",
    icon: "RotateCw",
  },
  {
    slug: "treatment-follow-up",
    title: "Treatment follow-up",
    description: "Follow up on unfinished treatment plans without pressuring patients.",
    icon: "ClipboardList",
  },
  {
    slug: "multi-location",
    title: "Multi-location operations",
    description: "Standardize front-desk communication across every practice location.",
    icon: "Building2",
  },
] as const;
