import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingBusinessPage() {
  return (
    <OnboardingShell currentStep={0}>
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <StepHeader title="Tell us about your business" subtitle="We'll tailor the AI agent and knowledge base to your context." />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Business name</Label>
              <Input defaultValue="Lumen Dental Care" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Industry</Label>
              <Select defaultValue="professional">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional services</SelectItem>
                  <SelectItem value="health">Health & wellness</SelectItem>
                  <SelectItem value="clinic">Clinic / dental</SelectItem>
                  <SelectItem value="orthodontic">Orthodontic practice</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="finance">Finance & tax</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Website</Label>
              <Input defaultValue="ateliernorth.example" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Time zone</Label>
              <Select defaultValue="ist">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">Asia/Calcutta (IST)</SelectItem>
                  <SelectItem value="est">America/New_York (EST)</SelectItem>
                  <SelectItem value="gmt">Europe/London (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/channels" backHref="/onboarding" />
    </OnboardingShell>
  );
}
