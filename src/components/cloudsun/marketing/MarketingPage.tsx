"use client";

import { MarketingHeader } from "./MarketingHeader";
import { Hero } from "./Hero";
import {
  ChannelOverview,
  UnifiedTimeline,
  AICapabilities,
  PhoneExperience,
  Appointments,
  Handoff,
  KnowledgeSection,
  AutomationSection,
  AnalyticsSection,
  SecuritySection,
  IntegrationsSection,
  PricingSection,
  FinalCTA,
  Footer,
} from "./Sections";

export function MarketingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        <Hero />
        <ChannelOverview />
        <UnifiedTimeline />
        <AICapabilities />
        <PhoneExperience />
        <Appointments />
        <Handoff />
        <KnowledgeSection />
        <AutomationSection />
        <AnalyticsSection />
        <SecuritySection />
        <IntegrationsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
