"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wordmark, Logo } from "../shared/Logo";
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Phone, Mail, MessageCircle, MessageSquare, Building2, Calendar, Bot, Clock, X, Check } from "lucide-react";

const steps = [
  { id: "business", label: "Business" },
  { id: "channels", label: "Channels" },
  { id: "knowledge", label: "Knowledge" },
  { id: "agent", label: "AI identity" },
  { id: "hours", label: "Availability" },
  { id: "test", label: "Test" },
  { id: "complete", label: "Complete" },
];

export function OnboardingFlow({ onComplete, onExit }: { onComplete: () => void; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const current = steps[step];

  function next() {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  }
  function back() {
    if (step > 0) setStep(step - 1);
    else onExit();
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card/60 px-5 backdrop-blur">
        <Wordmark className="!text-base" />
        <button onClick={onExit} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted">
          <X className="h-4 w-4" />
        </button>
      </header>

      {/* Progress */}
      <div className="border-b border-border bg-card/40 px-5 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.id} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${i < step ? "bg-[oklch(0.45_0.08_155)] text-white" : i === step ? "bg-[oklch(0.62_0.16_42)] text-white" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`hidden text-xs sm:block ${i === step ? "font-medium" : "text-muted-foreground"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-[oklch(0.45_0.08_155)]" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 items-start justify-center px-5 py-8">
        <div className="w-full max-w-2xl">
          {current.id === "business" && <BusinessStep />}
          {current.id === "channels" && <ChannelsStep />}
          {current.id === "knowledge" && <KnowledgeStep />}
          {current.id === "agent" && <AgentStep />}
          {current.id === "hours" && <HoursStep />}
          {current.id === "test" && <TestStep />}
          {current.id === "complete" && <CompleteStep />}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={back}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
            </Button>
            <Button size="sm" onClick={next} className="gap-1.5">
              {step === steps.length - 1 ? "Enter dashboard" : "Continue"}
              {step < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function BusinessStep() {
  return (
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
          <div>
            <Label className="text-xs">Business location</Label>
            <Input defaultValue="Bandra West, Mumbai" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Primary use case</Label>
            <Select defaultValue="front">
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="front">Answer calls + book appointments</SelectItem>
                <SelectItem value="support">Customer support</SelectItem>
                <SelectItem value="leads">Lead qualification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChannelsStep() {
  const channels = [
    { id: "phone", label: "Phone", icon: Phone, desc: "Demo telephony included. Bring Twilio later.", defaultOn: true },
    { id: "email", label: "Email", icon: Mail, desc: "Connect Gmail or Outlook.", defaultOn: false },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, desc: "WhatsApp Business API.", defaultOn: false },
    { id: "webchat", label: "Website chat", icon: MessageSquare, desc: "Embeddable widget.", defaultOn: true },
  ];
  return (
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
  );
}

function KnowledgeStep() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <StepHeader title="Add your knowledge sources" subtitle="The AI answers only from what you give it. Add what you have now; you can add more later." />
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { label: "Website import", desc: "Crawl your site" },
            { label: "File upload", desc: "PDF, DOCX, TXT" },
            { label: "Notion connection", desc: "Pages & databases" },
            { label: "Manual FAQs", desc: "Type Q&A pairs" },
            { label: "Business policies", desc: "Cancellation, refund, etc." },
            { label: "Google Drive", desc: "Folders & files" },
          ].map((k) => (
            <button key={k.label} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 p-3 text-left hover:bg-muted/40">
              <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{k.label}</div>
                <div className="text-[11px] text-muted-foreground">{k.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentStep() {
  return (
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
  );
}

function HoursStep() {
  return (
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
  );
}

function TestStep() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <StepHeader title="Test your AI agent" subtitle="Run a simulated conversation. See the AI answer, knowledge used and confidence." />
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="space-y-3">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-card px-3.5 py-2 text-sm shadow-soft">
                <div className="mb-0.5 text-[10px] opacity-70">Sunny (AI)</div>
                Thank you for calling Lumen Dental Care, this is Sunny. How can I help you today?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                <div className="mb-0.5 text-[10px] opacity-70">You (caller)</div>
                Hi, I'd like to book a consultation.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-tl-md bg-card px-3.5 py-2 text-sm shadow-soft">
                <div className="mb-0.5 text-[10px] opacity-70">Sunny (AI)</div>
                Of course. I have Thursday at 11:00 or Friday at 15:00. Which works for you?
                <div className="mt-1 text-[9px] opacity-60">confidence 88% · Sources: Services PDF, FAQ</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="text-[10px] uppercase text-muted-foreground">AI answer</div>
            <div className="mt-0.5 font-medium text-[oklch(0.45_0.08_155)]">Correct</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="text-[10px] uppercase text-muted-foreground">Confidence</div>
            <div className="mt-0.5 font-medium">0.88</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-2.5">
            <div className="text-[10px] uppercase text-muted-foreground">Handoff</div>
            <div className="mt-0.5 font-medium">Not needed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompleteStep() {
  const checklist = [
    { label: "Business details", done: true },
    { label: "1+ channel connected", done: true },
    { label: "1+ knowledge source", done: true },
    { label: "AI agent configured", done: true },
    { label: "Working hours set", done: true },
    { label: "Test conversation passed", done: true },
    { label: "Live telephony connected", done: false },
    { label: "Gmail authorized", done: false },
  ];
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.45_0.08_155)]/10">
          <Sparkles className="h-8 w-8 text-[oklch(0.45_0.08_155)]" />
        </div>
        <h2 className="mt-4 font-serif text-2xl">You're ready to go</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your AI front desk is configured. Connect live integrations when you&apos;re ready — until then, demo mode keeps everything usable.</p>
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
  );
}
