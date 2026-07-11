import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function OnboardingAvailabilityPage() {
  return (
    <OnboardingShell currentStep={4}>
      <Card className="border-border bg-card">
        <CardContent className="space-y-4 p-6">
          <StepHeader title="Set your availability" subtitle="Working hours, appointment types and buffers. The AI respects these." />
          <div className="space-y-1.5">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d, i) => (
              <div key={d} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-1.5 text-xs">
                <span className="w-24 text-muted-foreground">{d}</span>
                <Switch defaultChecked={i < 5} />
                <span className="flex-1 text-right">{i < 5 ? "9:00 – 18:00" : i === 5 ? "10:00 – 14:00" : "Closed"}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Buffer between appointments</Label>
              <Select defaultValue="15">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Default appointment length</Label>
              <Select defaultValue="45">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/test" backHref="/onboarding/agent" />
    </OnboardingShell>
  );
}
