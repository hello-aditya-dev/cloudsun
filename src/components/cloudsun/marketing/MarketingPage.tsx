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

export function MarketingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader onEnter={onEnter} />
      <main>
        <Hero onEnter={onEnter} />
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
        <FinalCTA onEnter={onEnter} />
      </main>
      <Footer />
    </div>
  );
}
