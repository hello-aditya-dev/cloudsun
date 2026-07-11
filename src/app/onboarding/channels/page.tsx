"use client";

import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Phone, Mail, MessageCircle, MessageSquare } from "lucide-react";

export default function OnboardingChannelsPage() {
  const channels = [
    { id: "phone", label: "Phone", icon: Phone, desc: "Demo telephony included. Bring Twilio later.", defaultOn: true },
    { id: "email", label: "Email", icon: Mail, desc: "Connect Gmail or Outlook.", defaultOn: false },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, desc: "WhatsApp Business API.", defaultOn: false },
    { id: "webchat", label: "Website chat", icon: MessageSquare, desc: "Embeddable widget.", defaultOn: true },
  ];
  return (
    <OnboardingShell currentStep={1}>
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <StepHeader title="Connect your channels" subtitle="You can skip any of these and come back later — we'll show what's incomplete." />
          <div className="space-y-2">
            {channels.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-card text-muted-foreground"><Icon className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.label}</div>
                    <div className="text-[11px] text-muted-foreground">{c.desc}</div>
                  </div>
                  <Switch defaultChecked={c.defaultOn} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/knowledge" backHref="/onboarding/business" />
    </OnboardingShell>
  );
}
