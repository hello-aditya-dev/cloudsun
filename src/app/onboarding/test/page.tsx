"use client";

import { useState } from "react";
import { OnboardingShell, StepHeader, StepNav } from "@/components/cloudsun/app/OnboardingShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles } from "lucide-react";
import { generateDentalAIResponse } from "@/lib/demo-ai";

export default function OnboardingTestPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thread, setThread] = useState<{ who: "user" | "ai"; text: string; confidence?: number }[]>([
    { who: "ai", text: "Thank you for calling Atelier North, this is Sunny. How can I help you today?", confidence: 0.95 },
  ]);

  function send() {
    if (!input.trim()) return;
    const userMsg = { who: "user" as const, text: input };
    setThread((t) => [...t, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const ai = generateDentalAIResponse(userMsg.text, "phone", "New Caller");
      setThread((t) => [...t, { who: "ai", text: ai.text, confidence: ai.confidence }]);
      setLoading(false);
    }, 1000);
  }

  return (
    <OnboardingShell currentStep={5}>
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <StepHeader title="Test your AI agent" subtitle="Run a simulated conversation. See the AI answer, knowledge used and confidence." />
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="space-y-3">
              {thread.map((m, i) => (
                <div key={i} className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.who === "user" ? "rounded-tr-md bg-primary text-primary-foreground" : "rounded-tl-md bg-card shadow-soft"}`}>
                    <div className="mb-0.5 text-[10px] opacity-70">{m.who === "user" ? "You (caller)" : "Sunny (AI, simulated)"}</div>
                    {m.text}
                    {m.confidence && <div className="mt-1 text-[9px] opacity-60">confidence {Math.round(m.confidence * 100)}%</div>}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-tl-md bg-card px-3.5 py-2 shadow-soft">
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" className="text-sm" />
            <Button onClick={send} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3" /> Simulated AI — no real model was called.
          </div>
        </CardContent>
      </Card>
      <StepNav nextHref="/onboarding/complete" backHref="/onboarding/availability" />
    </OnboardingShell>
  );
}
