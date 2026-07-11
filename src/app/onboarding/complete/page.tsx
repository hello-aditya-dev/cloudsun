import Link from "next/link";
import { OnboardingShell, StepHeader } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function OnboardingCompletePage() {
  const checklist = [
    { label: "Business details", done: true },
    { label: "1+ channel connected (demo)", done: true },
    { label: "1+ knowledge source", done: true },
    { label: "AI agent configured", done: true },
    { label: "Working hours set", done: true },
    { label: "Test conversation passed", done: true },
    { label: "Live telephony connected", done: false },
    { label: "Gmail authorized", done: false },
  ];
  return (
    <OnboardingShell currentStep={6}>
      <Card className="border-border bg-card">
        <CardContent className="p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.45_0.08_155)]/10">
            <Sparkles className="h-8 w-8 text-[oklch(0.45_0.08_155)]" />
          </div>
          <h2 className="mt-4 font-serif text-2xl">You&apos;re ready to go</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your AI front desk is configured for demo mode. Connect live integrations when you&apos;re ready — until then, everything stays usable.</p>
          <div className="mt-6 space-y-1.5 text-left">
            {checklist.map((c) => (
              <div key={c.label} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                {c.done ? <CheckCircle2 className="h-4 w-4 text-[oklch(0.45_0.08_155)]" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />}
                <span className={c.done ? "" : "text-muted-foreground"}>{c.label}</span>
                {!c.done && <Badge variant="outline" className="ml-auto text-[9px]">Optional</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-center">
        <Link href="/app"><Button size="lg" className="gap-1.5">Enter dashboard</Button></Link>
      </div>
    </OnboardingShell>
  );
}
