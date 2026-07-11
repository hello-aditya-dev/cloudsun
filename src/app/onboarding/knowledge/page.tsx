import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function OnboardingKnowledgePage() {
  const sources = [
    { label: "Website import", desc: "Crawl your site" },
    { label: "File upload", desc: "PDF, DOCX, TXT" },
    { label: "Notion connection", desc: "Pages & databases" },
    { label: "Manual FAQs", desc: "Type Q&A pairs" },
    { label: "Business policies", desc: "Cancellation, refund, etc." },
    { label: "Google Drive", desc: "Folders & files" },
  ];
  return (
    <OnboardingShell currentStep={2}>
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <StepHeader title="Add your knowledge sources" subtitle="The AI answers only from what you give it. Add what you have now; you can add more later." />
          <div className="grid gap-2 sm:grid-cols-2">
            {sources.map((s) => (
              <button key={s.label} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-left hover:bg-muted/40">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/agent" backHref="/onboarding/channels" />
    </OnboardingShell>
  );
}
