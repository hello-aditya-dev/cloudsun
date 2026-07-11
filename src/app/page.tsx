"use client";

import { useState, useEffect } from "react";
import { MarketingPage } from "@/components/cloudsun/marketing/MarketingPage";
import { AppShell } from "@/components/cloudsun/app/AppShell";
import { OnboardingFlow } from "@/components/cloudsun/app/OnboardingFlow";
import { OverviewSection } from "@/components/cloudsun/app/sections/OverviewSection";
import { InboxSection } from "@/components/cloudsun/app/sections/InboxSection";
import { CallsSection } from "@/components/cloudsun/app/sections/CallsSection";
import { ContactsSection } from "@/components/cloudsun/app/sections/ContactsSection";
import { CalendarSection } from "@/components/cloudsun/app/sections/CalendarSection";
import { AIAgentSection } from "@/components/cloudsun/app/sections/AIAgentSection";
import { KnowledgeSection } from "@/components/cloudsun/app/sections/KnowledgeSection";
import { AutomationsSection } from "@/components/cloudsun/app/sections/AutomationsSection";
import { AnalyticsSection } from "@/components/cloudsun/app/sections/AnalyticsSection";
import { TeamSection, IntegrationsSection, SettingsSection, BillingSection, AuditLogSection } from "@/components/cloudsun/app/sections/ManagementSections";
import { appNav } from "@/config/cloudsun";

type View = "marketing" | "onboarding" | "app";

const titleMap: Record<string, string> = Object.fromEntries(appNav.map((n) => [n.id, n.label]));

export default function Page() {
  const [view, setView] = useState<View>("marketing");
  const [section, setSection] = useState("overview");

  // Scroll to top on section change
  useEffect(() => {
    if (view === "app") {
      const main = document.querySelector("main");
      if (main) main.scrollTop = 0;
    }
  }, [section, view]);

  function enterApp() {
    setView("onboarding");
  }
  function finishOnboarding() {
    setView("app");
    setSection("overview");
  }

  if (view === "marketing") {
    return <MarketingPage onEnter={enterApp} />;
  }

  if (view === "onboarding") {
    return (
      <OnboardingFlow
        onComplete={finishOnboarding}
        onExit={() => setView("marketing")}
      />
    );
  }

  return (
    <AppShell
      section={section}
      onSection={setSection}
      onExit={() => setView("marketing")}
      title={titleMap[section] ?? "Overview"}
    >
      {section === "overview" && <OverviewSection onSection={setSection} />}
      {section === "inbox" && <InboxSection />}
      {section === "calls" && <CallsSection />}
      {section === "contacts" && <ContactsSection />}
      {section === "calendar" && <CalendarSection />}
      {section === "ai-agent" && <AIAgentSection />}
      {section === "knowledge" && <KnowledgeSection />}
      {section === "automations" && <AutomationsSection />}
      {section === "analytics" && <AnalyticsSection />}
      {section === "team" && <TeamSection />}
      {section === "integrations" && <IntegrationsSection />}
      {section === "settings" && <SettingsSection />}
      {section === "billing" && <BillingSection />}
      {section === "audit-log" && <AuditLogSection />}
    </AppShell>
  );
}
