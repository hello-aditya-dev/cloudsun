import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingLanding() {
  return (
    <OnboardingShell currentStep={0}>
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <StepHeader title="Welcome to CloudSun" subtitle="Set up your AI front desk in a few steps. Demo mode works immediately — no credentials required." />
          <div className="rounded-lg border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-4 text-sm">
            <div className="font-medium">Interactive demo mode</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Everything you do here is saved locally in your browser. You can connect real providers later from Settings → Integrations.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
            <div className="text-sm">
              <div className="font-medium">Ready to start?</div>
              <div className="text-xs text-muted-foreground">7 steps · about 5 minutes</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/business" nextLabel="Begin setup" backHref="/" />
    </OnboardingShell>
  );
}
