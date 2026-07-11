"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { demoAIConfig } from "@/lib/repositories";
import { generateDemoAIResponse } from "@/lib/demo-ai";
import type { ChannelId } from "@/config/cloudsun";
import {
  Sparkles, Bot, Phone, Mail, MessageCircle, MessageSquare, Shield,
  CheckCircle2, AlertTriangle, Send, Loader2, Volume2, Save, Eye,
  BookOpen, Calendar, UserPlus, FileText, Tag as TagIcon, PhoneOff,
} from "lucide-react";

const toolPermissions = [
  { name: "Read calendar availability", icon: Calendar, current: "execute" as const },
  { name: "Book appointment", icon: Calendar, current: "execute" as const },
  { name: "Reschedule appointment", icon: Calendar, current: "suggest" as const },
  { name: "Cancel appointment", icon: Calendar, current: "approval" as const },
  { name: "Create contact", icon: UserPlus, current: "execute" as const },
  { name: "Update contact", icon: UserPlus, current: "suggest" as const },
  { name: "Create lead", icon: UserPlus, current: "execute" as const },
  { name: "Send email", icon: Mail, current: "approval" as const },
  { name: "Send WhatsApp message", icon: MessageCircle, current: "execute" as const },
  { name: "Transfer call", icon: PhoneOff, current: "approval" as const },
  { name: "Create task", icon: FileText, current: "execute" as const },
  { name: "Apply tags", icon: TagIcon, current: "execute" as const },
];

const permLevels = [
  { value: "disabled", label: "Disabled", color: "oklch(0.5 0 0)" },
  { value: "suggest", label: "AI may suggest", color: "oklch(0.70 0.12 75)" },
  { value: "approval", label: "Requires approval", color: "oklch(0.62 0.16 42)" },
  { value: "execute", label: "AI may execute", color: "oklch(0.45 0.08 155)" },
] as const;

export function AIAgentSection() {
  const [tab, setTab] = useState("identity");
  const config = demoAIConfig.get();
  const [confidence, setConfidence] = useState([config.minConfidence]);
  const [sentiment, setSentiment] = useState([config.sentimentThreshold]);

  function saveConfig() {
    demoAIConfig.update({ minConfidence: confidence[0], sentimentThreshold: sentiment[0] });
  }
  function publishConfig() {
    demoAIConfig.update({ minConfidence: confidence[0], sentimentThreshold: sentiment[0] });
    demoAIConfig.publish();
  }

  return (
    <SectionScroll>
      <PageHeader
        title="AI Front Desk"
        subtitle="The control centre for your AI receptionist. Configure identity, behaviour, permissions and voice."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={saveConfig}><Save className="h-3.5 w-3.5" /> Save draft</Button>
            <Button size="sm" onClick={publishConfig}><Save className="h-3.5 w-3.5" /> Publish</Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40">
          <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
          <TabsTrigger value="behaviour" className="text-xs">Behaviour</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">Tool permissions</TabsTrigger>
          <TabsTrigger value="handoff" className="text-xs">Confidence & handoff</TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
          <TabsTrigger value="playground" className="text-xs">Test playground</TabsTrigger>
        </TabsList>

        {/* Identity */}
        <TabsContent value="identity" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border bg-card lg:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Agent name</Label>
                    <Input defaultValue="Sunny" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input defaultValue="AI front desk receptionist" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Business name</Label>
                    <Input defaultValue="Atelier North" className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Languages</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="both">English + Hindi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Greeting</Label>
                  <Textarea
                    className="mt-1"
                    defaultValue="Thank you for calling Atelier North, this is Sunny. How can I help you today?"
                  />
                </div>
                <div>
                  <Label className="text-xs">Closing</Label>
                  <Textarea
                    className="mt-1"
                    defaultValue="Thank you for calling Atelier North. Have a wonderful day."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Tone</Label>
                    <Select defaultValue="warm">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="warm">Warm</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Formality</Label>
                    <Select defaultValue="balanced">
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[oklch(0.62_0.16_42)]/10">
                  <Bot className="h-10 w-10 text-[oklch(0.62_0.16_42)]" />
                </div>
                <div className="mt-4 font-serif text-xl">Sunny</div>
                <p className="mt-1 text-xs text-muted-foreground">Atelier North&apos;s AI front desk agent. Draft version 4.</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className="text-[10px] gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" /> Draft</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last published</span><span>Jul 9, 14:22</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Languages</span><span>English</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4 border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pronunciation dictionary</div>
              <div className="space-y-1.5">
                {[
                  { word: "Atelier", say: "ah-tel-YAY" },
                  { word: "Bélanger", say: "bay-LAN-jay" },
                  { word: "Saanvi", say: "SAHN-vee" },
                ].map((p) => (
                  <div key={p.word} className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                    <span className="font-medium">{p.word}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="flex-1">{p.say}</span>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]">+ Add word</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behaviour */}
        <TabsContent value="behaviour" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conversation rules</div>
                {[
                  "Ask one question at a time",
                  "Confirm important details before booking",
                  "Never invent pricing — say you'll check",
                  "Never promise unavailable times",
                  "Disclose that the customer is speaking with AI",
                  "Respect working hours",
                ].map((r) => (
                  <div key={r} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/30">
                    <span>{r}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="space-y-1 p-6">
                <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Edge cases</div>
                {[
                  "Handle interruptions gracefully",
                  "Handle silence (3s) — ask if they're there",
                  "Handle angry customers — escalate immediately",
                  "Avoid restricted topics (politics, religion, medical advice)",
                  "Ask for human help when uncertain",
                ].map((r) => (
                  <div key={r} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/30">
                    <span>{r}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
                <div className="mt-2 rounded-md border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                  Restricted topics list: medical diagnoses, legal advice, pricing commitments beyond published rates, political opinions.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels */}
        <TabsContent value="channels" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { ch: "phone", icon: Phone, greeting: "Thank you for calling Atelier North, this is Sunny." },
              { ch: "email", icon: Mail, greeting: "Hi {{name}}, thanks for reaching out to Atelier North." },
              { ch: "whatsapp", icon: MessageCircle, greeting: "Hi! Thanks for messaging Atelier North. How can I help?" },
              { ch: "webchat", icon: MessageSquare, greeting: "Hi there! I'm Sunny, the Atelier North assistant." },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <Card key={c.ch} className="border-border bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{c.ch}</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="mt-3">
                      <Label className="text-xs">Greeting</Label>
                      <Textarea className="mt-1 text-xs" defaultValue={c.greeting} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <Label className="text-[11px]">Response length</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="short">Short</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="long">Long</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-[11px]">Wait time</Label>
                        <Select defaultValue="2s">
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0s">Immediate</SelectItem>
                            <SelectItem value="2s">2 seconds</SelectItem>
                            <SelectItem value="5s">5 seconds</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tool permissions */}
        <TabsContent value="permissions" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Each permission supports four levels: Disabled, AI may suggest, Requires approval, AI may execute.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {toolPermissions.map((t) => {
                  const Icon = t.icon;
                  return (
                    <div key={t.name} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{t.name}</div>
                        <Select defaultValue={t.current}>
                          <SelectTrigger className="mt-1 h-7 text-[11px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {permLevels.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Confidence & handoff */}
        <TabsContent value="handoff" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="space-y-5 p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thresholds</div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Minimum AI confidence</span>
                    <span className="font-mono text-xs text-[oklch(0.62_0.16_42)]">{confidence[0]}%</span>
                  </div>
                  <Slider value={confidence} onValueChange={setConfidence} max={100} min={20} step={5} />
                  <p className="mt-1 text-[11px] text-muted-foreground">Below this, the AI pauses and asks for approval.</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>Negative sentiment threshold</span>
                    <span className="font-mono text-xs text-[oklch(0.62_0.16_42)]">{sentiment[0]}%</span>
                  </div>
                  <Slider value={sentiment} onValueChange={setSentiment} max={100} min={0} step={5} />
                  <p className="mt-1 text-[11px] text-muted-foreground">Below this sentiment score, escalate to a human.</p>
                </div>
                <div>
                  <Label className="text-xs">Max failed attempts before handoff</Label>
                  <Input type="number" defaultValue={2} className="mt-1" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Escalation rules</div>
                {[
                  { rule: "VIP client detected", dest: "Owner (Amara)" },
                  { rule: "Negative sentiment", dest: "Manager on duty" },
                  { rule: "Urgent keywords ('cancel', 'refund', 'lawyer')", dest: "Manager on duty" },
                  { rule: "Restricted topic", dest: "Human agent" },
                  { rule: "After hours", dest: "Voicemail + WhatsApp follow-up" },
                ].map((r) => (
                  <div key={r.rule} className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="text-xs font-medium">{r.rule}</div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <AlertTriangle className="h-3 w-3 text-[oklch(0.62_0.16_42)]" /> → {r.dest}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Voice */}
        <TabsContent value="voice" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Voice selection</Label>
                  <Select defaultValue="aria">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aria">Aria — warm, neutral</SelectItem>
                      <SelectItem value="oliver">Oliver — calm, deeper</SelectItem>
                      <SelectItem value="meera">Meera — bright, upbeat</SelectItem>
                      <SelectItem value="kabir">Kabir — steady, professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Speaking speed</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.9">0.9× — slower</SelectItem>
                      <SelectItem value="1">1.0× — normal</SelectItem>
                      <SelectItem value="1.1">1.1× — faster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Warmth</span><span className="text-muted-foreground">7/10</span></div>
                  <Slider defaultValue={[70]} max={100} step={5} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Expressiveness</span><span className="text-muted-foreground">5/10</span></div>
                  <Slider defaultValue={[50]} max={100} step={5} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Interruption sensitivity</span><span className="text-muted-foreground">8/10</span></div>
                  <Slider defaultValue={[80]} max={100} step={5} />
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Button size="sm" className="gap-1.5"><Volume2 className="h-3.5 w-3.5" /> Test voice</Button>
                  <div className="flex flex-1 items-center gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span key={i} className="flex-1 rounded-full bg-[oklch(0.62_0.16_42)]/40" style={{ height: `${6 + Math.abs(Math.sin(i)) * 18}px` }} />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">&ldquo;Thank you for calling Atelier North, this is Sunny. How can I help you today?&rdquo;</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <span className="text-xs">Silence handling</span><Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <span className="text-xs">Background-noise handling</span><Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test playground */}
        <TabsContent value="playground" className="mt-4">
          <TestPlayground />
        </TabsContent>
      </Tabs>
    </SectionScroll>
  );
}

function TestPlayground() {
  const aiConfig = demoAIConfig.get();
  const [channel, setChannel] = useState<ChannelId>("phone");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastIntent, setLastIntent] = useState<string | null>(null);
  const [lastCitations, setLastCitations] = useState<string[]>([]);
  const [lastToolCall, setLastToolCall] = useState<string | null>(null);
  const [lastApproval, setLastApproval] = useState(false);
  const [lastHandoff, setLastHandoff] = useState(false);
  const [thread, setThread] = useState<{ who: "user" | "ai"; text: string; confidence?: number; intent?: string }[]>([
    { who: "ai", text: aiConfig.greeting, confidence: 0.95 },
  ]);

  function send() {
    if (!input.trim()) return;
    const userMsg = { who: "user" as const, text: input };
    setThread((t) => [...t, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const ai = generateDemoAIResponse(userMsg.text, channel, "New Caller");
      setLastIntent(ai.intent);
      setLastCitations(ai.citations);
      setLastToolCall(ai.toolCall ?? null);
      setLastApproval(ai.approvalRequired);
      setLastHandoff(ai.handoff);
      setThread((t) => [...t, {
        who: "ai",
        text: ai.text,
        confidence: ai.confidence,
        intent: ai.intent,
      }]);
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border-border bg-card lg:col-span-2">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
              {([
                { id: "phone", label: "Phone" },
                { id: "whatsapp", label: "WhatsApp" },
                { id: "email", label: "Email" },
                { id: "webchat", label: "Web chat" },
              ] as { id: ChannelId; label: string }[]).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`rounded-md px-3 py-1 text-xs ${channel === c.id ? "bg-card font-medium shadow-soft" : "text-muted-foreground"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="text-[10px]">Draft v{aiConfig.draftVersion}</Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" /> Simulated
            </Badge>
          </div>

          <div className="min-h-[280px] space-y-3 rounded-xl border border-border bg-muted/20 p-4">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.who === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.who === "user" ? "rounded-tr-md bg-primary text-primary-foreground" : "rounded-tl-md bg-card shadow-soft"}`}>
                  <div className="mb-0.5 text-[10px] opacity-70">{m.who === "user" ? "You" : `${aiConfig.agentName} (AI, simulated)`}</div>
                  {m.text}
                  {m.confidence && <div className="mt-1 text-[9px] opacity-60">confidence {Math.round(m.confidence * 100)}%{m.intent ? ` · intent: ${m.intent}` : ""}</div>}
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

          <div className="mt-3 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              className="text-sm"
            />
            <Button onClick={send} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Detected intent
            </div>
            {lastIntent ? (
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Intent</span><span className="font-medium capitalize">{lastIntent.replace("_", " ")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approval required</span><span>{lastApproval ? "Yes" : "No"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Handoff</span><span>{lastHandoff ? "Yes" : "No"}</span></div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">Send a message to detect intent.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> Retrieved knowledge
            </div>
            <div className="space-y-2 text-xs">
              {lastCitations.length > 0 ? lastCitations.map((src) => (
                <div key={src} className="rounded-lg border border-border bg-muted/20 p-2.5">
                  <div className="font-medium">{src}</div>
                  <div className="text-[11px] text-muted-foreground">cited in simulated response</div>
                </div>
              )) : (
                <div className="text-xs text-muted-foreground">No citations yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proposed tool call</div>
            <div className="space-y-1.5 text-xs">
              {lastToolCall ? (
                <div className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.45_0.08_155)]" /> {lastToolCall}</div>
              ) : (
                <div className="text-xs text-muted-foreground">No tool call proposed.</div>
              )}
              <div className="text-[10px] text-muted-foreground">Tool calls are simulated. Configure an AI provider in production.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Was this correct?</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.45_0.08_155)]" /> Correct</Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-[oklch(0.62_0.16_42)]"><AlertTriangle className="h-3.5 w-3.5" /> Incorrect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
