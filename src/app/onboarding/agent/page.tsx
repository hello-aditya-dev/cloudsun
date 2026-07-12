import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot } from "lucide-react";

export default function OnboardingAgentPage() {
  return (
    <OnboardingShell currentStep={3}>
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <StepHeader title="Give your AI agent an identity" subtitle="Name, voice, tone, greeting. You can change everything later." />
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(0.62_0.16_42)]/10">
              <Bot className="h-7 w-7 text-[oklch(0.62_0.16_42)]" />
            </div>
            <div className="flex-1">
              <Label className="text-xs">Agent name</Label>
              <Input defaultValue="Sunny" className="mt-1" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Voice</Label>
              <Select defaultValue="aria">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aria">Aria — warm, neutral</SelectItem>
                  <SelectItem value="oliver">Oliver — calm, deeper</SelectItem>
                  <SelectItem value="meera">Meera — bright, upbeat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tone</Label>
              <Select defaultValue="warm">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Greeting</Label>
            <Textarea className="mt-1" defaultValue="Thank you for calling Lumen Dental Care, this is Sunny. How can I help you today?" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
            <div className="text-xs">
              <div className="font-medium">Disclose AI status</div>
              <div className="text-muted-foreground">Tell callers they're speaking with an AI assistant.</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/availability" backHref="/onboarding/knowledge" />
    </OnboardingShell>
  );
}
