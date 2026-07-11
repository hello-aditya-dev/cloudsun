/**
 * CloudSun — central product configuration.
 * Change branding, navigation, channels and feature flags from this single file.
 */

export const product = {
  name: "CloudSun",
  tagline: "Every client conversation. One intelligent front desk.",
  supporting:
    "Answer phone calls, manage email, respond on WhatsApp, handle website chat and book appointments from one AI-powered workspace.",
  category: "Omnichannel AI Front Desk",
  repository: "hello-aditya-dev/cloudsun",
  authorIdentity: "hello-aditya-dev",
  description:
    "Omnichannel AI front desk and shared client inbox for phone calls, email, WhatsApp, website chat and appointment scheduling.",
  email: "hello@cloudsun.app",
  demoModeLabel: "Demo mode",
  currentYear: 2026,
} as const;

/**
 * One truthful capability state model.
 * Every channel and integration status must come from this enum.
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
  | "disabled";

export const capabilityLabel: Record<CapabilityState, string> = {
  demo: "Interactive demo",
  not_connected: "Provider not connected",
  connecting: "Connecting…",
  connected: "Connected",
  reauthorization_required: "Reauthorization required",
  sync_delayed: "Sync delayed",
  error: "Error",
  disabled: "Disabled",
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
    description: "AI answers, transcribes, routes and books.",
  },
  email: {
    id: "email",
    label: "Email",
    short: "Email",
    color: "oklch(0.45 0.08 155)",
    dot: "bg-[oklch(0.45_0.08_155)]",
    description: "Drafts, triages and replies in your tone.",
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

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  group: "primary" | "secondary";
  badge?: string;
}

export const appNav: NavItem[] = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard", group: "primary" },
  { id: "inbox", label: "Inbox", icon: "Inbox", group: "primary", badge: "12" },
  { id: "calls", label: "Calls", icon: "Phone", group: "primary" },
  { id: "contacts", label: "Contacts", icon: "Users", group: "primary" },
  { id: "calendar", label: "Calendar", icon: "CalendarDays", group: "primary" },
  { id: "ai-agent", label: "AI Front Desk", icon: "Sparkles", group: "primary" },
  { id: "knowledge", label: "Knowledge", icon: "BookOpen", group: "primary" },
  { id: "automations", label: "Automations", icon: "Workflow", group: "primary" },
  { id: "analytics", label: "Analytics", icon: "BarChart3", group: "primary" },
  { id: "team", label: "Team", icon: "UserCog", group: "secondary" },
  { id: "integrations", label: "Integrations", icon: "Plug", group: "secondary" },
  { id: "settings", label: "Settings", icon: "Settings", group: "secondary" },
  { id: "billing", label: "Billing", icon: "CreditCard", group: "secondary" },
  { id: "audit-log", label: "Audit log", icon: "ShieldCheck", group: "secondary" },
];

export const marketingNav = [
  { label: "Product", href: "#product" },
  { label: "Channels", href: "#channels" },
  { label: "AI Front Desk", href: "#ai" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Security", href: "#security" },
];

export const pricingTiers = [
  {
    name: "Starter",
    price: "$49",
    cadence: "/month",
    summary: "For a single location finding its feet.",
    features: [
      "1 AI front desk agent",
      "1 phone number (demo telephony)",
      "Email + WhatsApp + website chat",
      "500 AI conversations / month",
      "Shared inbox for 3 humans",
      "Knowledge base (10 sources)",
      "7-day audit history",
    ],
    cta: "Start building",
    highlighted: false,
  },
  {
    name: "Practice",
    price: "$149",
    cadence: "/month",
    summary: "For busy clinics, salons and professional services.",
    features: [
      "3 AI front desk agents",
      "3 phone numbers (demo telephony)",
      "All channels connected",
      "3,000 AI conversations / month",
      "Shared inbox for 10 humans",
      "Knowledge base (50 sources)",
      "Automations builder",
      "90-day audit history",
      "Priority email support",
    ],
    cta: "Start building",
    highlighted: true,
  },
  {
    name: "Organization",
    price: "Custom",
    cadence: "",
    summary: "For multi-location operators and enterprise teams.",
    features: [
      "Unlimited AI agents",
      "Volume telephony (bring your own)",
      "SSO + role-based permissions",
      "Custom AI confidence policies",
      "Dedicated success manager",
      "Unlimited knowledge sources",
      "1-year audit retention",
      "Onboarding and migration help",
    ],
    cta: "Talk to us",
    highlighted: false,
  },
];

export const integrationCatalog = [
  { name: "Gmail", category: "Communication", status: "available", icon: "Mail" },
  { name: "Microsoft Outlook", category: "Communication", status: "available", icon: "Mail" },
  { name: "WhatsApp Business", category: "Communication", status: "available", icon: "MessageCircle" },
  { name: "Website chat widget", category: "Communication", status: "available", icon: "MessageSquare" },
  { name: "Twilio telephony", category: "Communication", status: "available", icon: "Phone" },
  { name: "Google Calendar", category: "Calendar", status: "available", icon: "Calendar" },
  { name: "Microsoft Calendar", category: "Calendar", status: "available", icon: "Calendar" },
  { name: "Notion", category: "Calendar", status: "available", icon: "FileText" },
  { name: "Zoom", category: "Meetings", status: "available", icon: "Video" },
  { name: "Google Meet", category: "Meetings", status: "available", icon: "Video" },
  { name: "Microsoft Teams", category: "Meetings", status: "available", icon: "Video" },
  { name: "HubSpot", category: "CRM", status: "available", icon: "Briefcase" },
  { name: "Salesforce", category: "CRM", status: "available", icon: "Briefcase" },
  { name: "Pipedrive", category: "CRM", status: "available", icon: "Briefcase" },
  { name: "Webhooks", category: "Automation", status: "available", icon: "Webhook" },
  { name: "Zapier", category: "Automation", status: "available", icon: "Zap" },
  { name: "REST API", category: "Automation", status: "available", icon: "Code" },
  { name: "Google Drive", category: "Storage", status: "available", icon: "HardDrive" },
] as const;

export const featureFlags = {
  liveTelephony: false,
  liveEmail: false,
  liveWhatsApp: false,
  liveWebchat: true,
  liveCalendar: false,
  liveAi: true,
  sso: false,
} as const;
