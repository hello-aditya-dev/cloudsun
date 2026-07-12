"use client";

import { useState, useCallback, useEffect } from "react";
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
import { generateDentalAIResponse } from "@/lib/demo-ai";
import { subscribe } from "@/lib/demo-store";
import type { AIConfigState } from "@/lib/demo-store";
import type { ChannelId } from "@/config/cloudsun";
import {
  Sparkles, Bot, Phone, Mail, MessageCircle, MessageSquare, Shield,
  CheckCircle2, AlertTriangle, Send, Loader2, Volume2, Save, Eye,
  BookOpen, Calendar, UserPlus, FileText, Tag as TagIcon, PhoneOff,
  Plus, Trash2, Upload, Siren, HeartPulse, Users, ClipboardList,
} from "lucide-react";

// ─── Tool permission metadata ───────────────────────────────────────────────

const toolMeta: { key: string; name: string; icon: typeof Calendar }[] = [
  { key: "read_calendar_availability", name: "Read calendar availability", icon: Calendar },
  { key: "book_appointment", name: "Book appointment", icon: Calendar },
  { key: "reschedule_appointment", name: "Reschedule appointment", icon: Calendar },
  { key: "cancel_appointment", name: "Cancel appointment", icon: Calendar },
  { key: "create_contact", name: "Create contact", icon: UserPlus },
  { key: "update_contact", name: "Update contact", icon: UserPlus },
  { key: "create_lead", name: "Create lead", icon: UserPlus },
  { key: "send_email", name: "Send email", icon: Mail },
  { key: "send_whatsapp", name: "Send WhatsApp message", icon: MessageCircle },
  { key: "transfer_call", name: "Transfer call", icon: PhoneOff },
  { key: "create_task", name: "Create task", icon: FileText },
  { key: "apply_tags", name: "Apply tags", icon: TagIcon },
];

const permLevels = [
  { value: "disabled" as const, label: "Disabled", color: "oklch(0.5 0 0)" },
  { value: "suggest" as const, label: "AI may suggest", color: "oklch(0.70 0.12 75)" },
  { value: "approval" as const, label: "Requires approval", color: "oklch(0.62 0.16 42)" },
  { value: "execute" as const, label: "AI may execute", color: "oklch(0.45 0.08 155)" },
];

// ─── Channel metadata ────────────────────────────────────────────────────────

const channelMeta: { id: string; icon: typeof Phone }[] = [
  { id: "phone", icon: Phone },
  { id: "email", icon: Mail },
  { id: "whatsapp", icon: MessageCircle },
  { id: "webchat", icon: MessageSquare },
];

// ─── Helper: format published timestamp ──────────────────────────────────────

function formatPublished(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ═════════════════════════════════════════════════════════════════════════════
// Main component
// ═════════════════════════════════════════════════════════════════════════════

export function AIAgentSection() {
  // ─── Load initial state from persistence ──────────────────────────────────
  const loadedConfig = demoAIConfig.get();

  // ─── All controlled state ─────────────────────────────────────────────────
  const [agentName, setAgentName] = useState(loadedConfig.agentName);
  const [role, setRole] = useState(loadedConfig.role);
  const [businessName, setBusinessName] = useState(loadedConfig.businessName);
  const [locationId, setLocationId] = useState(loadedConfig.locationId);
  const [greeting, setGreeting] = useState(loadedConfig.greeting);
  const [closing, setClosing] = useState(loadedConfig.closing);
  const [tone, setTone] = useState(loadedConfig.tone);
  const [formality, setFormality] = useState(loadedConfig.formality);
  const [languages, setLanguages] = useState<string[]>(loadedConfig.languages);
  const [pronunciationDict, setPronunciationDict] = useState(loadedConfig.pronunciationDict);
  const [disclosure, setDisclosure] = useState(loadedConfig.disclosure);

  const [newPatientQuestions, setNewPatientQuestions] = useState<string[]>(loadedConfig.newPatientQuestions);
  const [existingPatientRules, setExistingPatientRules] = useState<string[]>(loadedConfig.existingPatientRules);
  const [emergencyRules, setEmergencyRules] = useState(loadedConfig.emergencyRules);

  const [confidence, setConfidence] = useState([loadedConfig.minConfidence]);
  const [sentiment, setSentiment] = useState([loadedConfig.sentimentThreshold]);
  const [maxFailedAttempts, setMaxFailedAttempts] = useState(loadedConfig.maxFailedAttempts);

  const [toolPermissions, setToolPermissions] = useState<Record<string, "disabled" | "suggest" | "approval" | "execute">>(loadedConfig.toolPermissions);
  const [handoffRules, setHandoffRules] = useState(loadedConfig.handoffRules);
  const [channelSettings, setChannelSettings] = useState(loadedConfig.channelSettings);

  const [voice, setVoice] = useState(loadedConfig.voice);
  const [speakingSpeed, setSpeakingSpeed] = useState(loadedConfig.speakingSpeed);
  const [warmth, setWarmth] = useState([loadedConfig.warmth]);
  const [expressiveness, setExpressiveness] = useState([loadedConfig.expressiveness]);
  const [interruptionSensitivity, setInterruptionSensitivity] = useState([loadedConfig.interruptionSensitivity]);

  const [publishedAt, setPublishedAt] = useState<string | null>(loadedConfig.publishedAt);
  const [draftVersion, setDraftVersion] = useState(loadedConfig.draftVersion);

  // ─── Save/publish feedback ────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [tab, setTab] = useState("identity");

  // ─── Pronunciation add form ───────────────────────────────────────────────
  const [newWord, setNewWord] = useState("");
  const [newSay, setNewSay] = useState("");

  // ─── New-patient / existing-patient / handoff add forms ────────────────────
  const [newQuestionInput, setNewQuestionInput] = useState("");
  const [newRuleInput, setNewRuleInput] = useState("");
  const [newHandoffRule, setNewHandoffRule] = useState("");
  const [newHandoffDest, setNewHandoffDest] = useState("");

  // ─── Dirty tracking ───────────────────────────────────────────────────────
  // We compare current local state against the last persisted snapshot.

  const buildPatch = useCallback((): AIConfigState => ({
    agentName,
    role,
    businessName,
    locationId,
    greeting,
    closing,
    tone,
    formality,
    languages,
    pronunciationDict,
    disclosure,
    newPatientQuestions,
    existingPatientRules,
    emergencyRules,
    minConfidence: confidence[0],
    sentimentThreshold: sentiment[0],
    maxFailedAttempts,
    toolPermissions,
    handoffRules,
    channelSettings,
    voice,
    speakingSpeed,
    warmth: warmth[0],
    expressiveness: expressiveness[0],
    interruptionSensitivity: interruptionSensitivity[0],
    publishedAt,
    draftVersion,
  }), [
    agentName, role, businessName, locationId, greeting, closing, tone, formality,
    languages, pronunciationDict, disclosure, newPatientQuestions, existingPatientRules,
    emergencyRules, confidence, sentiment, maxFailedAttempts, toolPermissions,
    handoffRules, channelSettings, voice, speakingSpeed, warmth, expressiveness,
    interruptionSensitivity, publishedAt, draftVersion,
  ]);

  // ─── Dirty tracking via state ─────────────────────────────────────────────
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() => JSON.stringify(buildPatch()));
  const dirty = JSON.stringify(buildPatch()) !== savedSnapshot;

  // ─── Subscribe to external state changes (e.g. reset) ─────────────────────
  useEffect(() => {
    const unsub = subscribe(() => {
      const fresh = demoAIConfig.get();
      setAgentName(fresh.agentName);
      setRole(fresh.role);
      setBusinessName(fresh.businessName);
      setLocationId(fresh.locationId);
      setGreeting(fresh.greeting);
      setClosing(fresh.closing);
      setTone(fresh.tone);
      setFormality(fresh.formality);
      setLanguages(fresh.languages);
      setPronunciationDict(fresh.pronunciationDict);
      setDisclosure(fresh.disclosure);
      setNewPatientQuestions(fresh.newPatientQuestions);
      setExistingPatientRules(fresh.existingPatientRules);
      setEmergencyRules(fresh.emergencyRules);
      setConfidence([fresh.minConfidence]);
      setSentiment([fresh.sentimentThreshold]);
      setMaxFailedAttempts(fresh.maxFailedAttempts);
      setToolPermissions(fresh.toolPermissions);
      setHandoffRules(fresh.handoffRules);
      setChannelSettings(fresh.channelSettings);
      setVoice(fresh.voice);
      setSpeakingSpeed(fresh.speakingSpeed);
      setWarmth([fresh.warmth]);
      setExpressiveness([fresh.expressiveness]);
      setInterruptionSensitivity([fresh.interruptionSensitivity]);
      setPublishedAt(fresh.publishedAt);
      setDraftVersion(fresh.draftVersion);
      setSavedSnapshot(JSON.stringify(fresh));
    });
    return unsub;
  }, []);

  // ─── Save draft ───────────────────────────────────────────────────────────
  function saveDraft() {
    setSaveStatus("saving");
    const patch = buildPatch();
    demoAIConfig.update(patch);
    // After update, re-read to get the incremented draftVersion
    const fresh = demoAIConfig.get();
    setDraftVersion(fresh.draftVersion);
    setSavedSnapshot(JSON.stringify(fresh));
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }

  // ─── Publish ──────────────────────────────────────────────────────────────
  function publishConfig() {
    setSaveStatus("saving");
    const patch = buildPatch();
    demoAIConfig.update(patch);
    demoAIConfig.publish();
    const fresh = demoAIConfig.get();
    setDraftVersion(fresh.draftVersion);
    setPublishedAt(fresh.publishedAt);
    setSavedSnapshot(JSON.stringify(fresh));
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }

  // ─── Helpers for list mutations ───────────────────────────────────────────
  function addPronunciation() {
    if (!newWord.trim() || !newSay.trim()) return;
    setPronunciationDict((prev) => [...prev, { word: newWord.trim(), say: newSay.trim() }]);
    setNewWord("");
    setNewSay("");
  }
  function removePronunciation(idx: number) {
    setPronunciationDict((prev) => prev.filter((_, i) => i !== idx));
  }

  function addQuestion() {
    if (!newQuestionInput.trim()) return;
    setNewPatientQuestions((prev) => [...prev, newQuestionInput.trim()]);
    setNewQuestionInput("");
  }
  function removeQuestion(idx: number) {
    setNewPatientQuestions((prev) => prev.filter((_, i) => i !== idx));
  }
  function editQuestion(idx: number, value: string) {
    setNewPatientQuestions((prev) => prev.map((q, i) => i === idx ? value : q));
  }

  function addExistingRule() {
    if (!newRuleInput.trim()) return;
    setExistingPatientRules((prev) => [...prev, newRuleInput.trim()]);
    setNewRuleInput("");
  }
  function removeExistingRule(idx: number) {
    setExistingPatientRules((prev) => prev.filter((_, i) => i !== idx));
  }
  function editExistingRule(idx: number, value: string) {
    setExistingPatientRules((prev) => prev.map((r, i) => i === idx ? value : r));
  }

  function toggleEmergency(idx: number) {
    setEmergencyRules((prev) => prev.map((r, i) => i === idx ? { ...r, enabled: !r.enabled } : r));
  }

  function setToolPerm(key: string, level: "disabled" | "suggest" | "approval" | "execute") {
    setToolPermissions((prev) => ({ ...prev, [key]: level }));
  }

  function toggleHandoff(idx: number) {
    setHandoffRules((prev) => prev.map((r, i) => i === idx ? { ...r, enabled: !r.enabled } : r));
  }
  function setHandoffDest(idx: number, dest: string) {
    setHandoffRules((prev) => prev.map((r, i) => i === idx ? { ...r, destination: dest } : r));
  }
  function addHandoffRule() {
    if (!newHandoffRule.trim() || !newHandoffDest.trim()) return;
    setHandoffRules((prev) => [...prev, { rule: newHandoffRule.trim(), destination: newHandoffDest.trim(), enabled: true }]);
    setNewHandoffRule("");
    setNewHandoffDest("");
  }
  function removeHandoffRule(idx: number) {
    setHandoffRules((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateChannelSetting(ch: string, field: "enabled" | "greeting" | "responseLength" | "waitTime", value: string | boolean) {
    setChannelSettings((prev) => ({
      ...prev,
      [ch]: { ...prev[ch], [field]: value },
    }));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <SectionScroll>
      <PageHeader
        title="AI Front Desk"
        subtitle="The control centre for your AI receptionist. Configure identity, behaviour, permissions and voice."
        action={
          <div className="flex items-center gap-2">
            {dirty && (
              <Badge variant="outline" className="text-[10px] gap-1 border-[oklch(0.70_0.12_75)] text-[oklch(0.70_0.12_75)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" /> Unsaved
              </Badge>
            )}
            {!dirty && publishedAt && (
              <Badge variant="outline" className="text-[10px] gap-1 border-[oklch(0.45_0.08_155)] text-[oklch(0.45_0.08_155)]">
                <CheckCircle2 className="h-2.5 w-2.5" /> Published
              </Badge>
            )}
            {saveStatus === "saving" && (
              <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-[oklch(0.45_0.08_155)]">Saved ✓</span>
            )}
            <Button variant="outline" size="sm" onClick={saveDraft} disabled={saveStatus === "saving"}>
              <Save className="h-3.5 w-3.5" /> Save draft
            </Button>
            <Button size="sm" onClick={publishConfig} disabled={saveStatus === "saving"}>
              <Upload className="h-3.5 w-3.5" /> Publish
            </Button>
          </div>
        }
      />

      {/* Status bar */}
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span>Draft v{draftVersion}</span>
        <span>·</span>
        <span>Last published: {formatPublished(publishedAt)}</span>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/40 flex flex-wrap">
          <TabsTrigger value="identity" className="text-xs">Identity</TabsTrigger>
          <TabsTrigger value="new-patient" className="text-xs">New-patient intake</TabsTrigger>
          <TabsTrigger value="existing-patient" className="text-xs">Existing-patient</TabsTrigger>
          <TabsTrigger value="emergency" className="text-xs">Emergency safety</TabsTrigger>
          <TabsTrigger value="permissions" className="text-xs">Tool permissions</TabsTrigger>
          <TabsTrigger value="handoff" className="text-xs">Handoff rules</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">Voice</TabsTrigger>
          <TabsTrigger value="playground" className="text-xs">Test playground</TabsTrigger>
        </TabsList>

        {/* ═══════ Identity ═══════ */}
        <TabsContent value="identity" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border bg-card lg:col-span-2">
              <CardContent className="space-y-4 p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Agent name</Label>
                    <Input value={agentName} onChange={(e) => setAgentName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Business name</Label>
                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Select value={locationId} onValueChange={setLocationId}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loc_main">Main Street Clinic</SelectItem>
                        <SelectItem value="loc_downtown">Downtown Branch</SelectItem>
                        <SelectItem value="loc_suburb">Westside Family Dental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Greeting</Label>
                  <Textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Closing</Label>
                  <Textarea value={closing} onChange={(e) => setClosing(e.target.value)} className="mt-1" />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs">Tone</Label>
                    <Select value={tone} onValueChange={setTone}>
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
                    <Select value={formality} onValueChange={setFormality}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informal">Informal</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Languages</Label>
                    <Select
                      value={languages.length > 1 ? "both" : languages[0] === "Hindi" ? "hi" : "en"}
                      onValueChange={(v) => {
                        if (v === "en") setLanguages(["English"]);
                        else if (v === "hi") setLanguages(["Hindi"]);
                        else if (v === "both") setLanguages(["English", "Hindi"]);
                      }}
                    >
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
                  <Label className="text-xs">AI disclosure statement</Label>
                  <Textarea
                    value={disclosure}
                    onChange={(e) => setDisclosure(e.target.value)}
                    className="mt-1"
                    rows={2}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">This message is spoken or shown to every caller before the conversation begins.</p>
                </div>
              </CardContent>
            </Card>

            {/* Sidebar summary */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[oklch(0.62_0.16_42)]/10">
                  <Bot className="h-10 w-10 text-[oklch(0.62_0.16_42)]" />
                </div>
                <div className="mt-4 font-serif text-xl">{agentName}</div>
                <p className="mt-1 text-xs text-muted-foreground">{businessName}&apos;s AI front desk agent. Draft version {draftVersion}.</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {dirty ? (
                      <Badge variant="outline" className="text-[10px] gap-1 border-[oklch(0.70_0.12_75)] text-[oklch(0.70_0.12_75)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" /> Draft
                      </Badge>
                    ) : publishedAt ? (
                      <Badge variant="outline" className="text-[10px] gap-1 border-[oklch(0.45_0.08_155)] text-[oklch(0.45_0.08_155)]">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Published
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" /> Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Last published</span><span>{formatPublished(publishedAt)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Languages</span><span>{languages.join(", ")}</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pronunciation dictionary */}
          <Card className="mt-4 border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pronunciation dictionary</div>
              <div className="space-y-1.5">
                {pronunciationDict.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                    <Input
                      value={p.word}
                      onChange={(e) => {
                        const next = [...pronunciationDict];
                        next[i] = { ...next[i], word: e.target.value };
                        setPronunciationDict(next);
                      }}
                      className="h-6 w-24 border-0 bg-transparent p-0 text-xs font-medium shadow-none focus:ring-0"
                    />
                    <span className="text-muted-foreground">→</span>
                    <Input
                      value={p.say}
                      onChange={(e) => {
                        const next = [...pronunciationDict];
                        next[i] = { ...next[i], say: e.target.value };
                        setPronunciationDict(next);
                      }}
                      className="h-6 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removePronunciation(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Word"
                    className="h-7 w-24 text-[11px]"
                    onKeyDown={(e) => e.key === "Enter" && addPronunciation()}
                  />
                  <span className="text-muted-foreground">→</span>
                  <Input
                    value={newSay}
                    onChange={(e) => setNewSay(e.target.value)}
                    placeholder="Pronunciation"
                    className="h-7 flex-1 text-[11px]"
                    onKeyDown={(e) => e.key === "Enter" && addPronunciation()}
                  />
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={addPronunciation} disabled={!newWord.trim() || !newSay.trim()}>
                    <Plus className="h-3 w-3" /> Add word
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ New-patient intake ═══════ */}
        <TabsContent value="new-patient" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <ClipboardList className="h-3.5 w-3.5" /> Intake questions
                </div>
                <p className="mb-3 text-[11px] text-muted-foreground">These questions are asked in order to every new patient.</p>
                <div className="space-y-1.5">
                  {newPatientQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] text-muted-foreground">{i + 1}</span>
                      <Input
                        value={q}
                        onChange={(e) => editQuestion(i, e.target.value)}
                        className="h-6 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                      />
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeQuestion(i)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      value={newQuestionInput}
                      onChange={(e) => setNewQuestionInput(e.target.value)}
                      placeholder="Add a question…"
                      className="h-7 flex-1 text-[11px]"
                      onKeyDown={(e) => e.key === "Enter" && addQuestion()}
                    />
                    <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={addQuestion} disabled={!newQuestionInput.trim()}>
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Users className="h-3.5 w-3.5" /> Intake workflow
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                    <span>Collect insurance information</span>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                    <span>Send welcome email after intake</span>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                    <span>Create patient record in CRM</span>
                    <Switch checked={true} onCheckedChange={() => {}} />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                    <span>Offer first-appointment discount</span>
                    <Switch checked={false} onCheckedChange={() => {}} />
                  </div>
                </div>
                <div className="mt-4 rounded-md border border-border bg-muted/20 p-3 text-[11px] text-muted-foreground">
                  Intake workflow toggles are simulated. In production, these connect to your CRM and marketing automation.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ Existing-patient requests ═══════ */}
        <TabsContent value="existing-patient" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> Rules for existing patients
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">These rules govern how the AI handles calls from existing patients.</p>
              <div className="space-y-1.5">
                {existingPatientRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-xs">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] text-muted-foreground">{i + 1}</span>
                    <Input
                      value={r}
                      onChange={(e) => editExistingRule(i, e.target.value)}
                      className="h-6 flex-1 border-0 bg-transparent p-0 text-xs shadow-none focus:ring-0"
                    />
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeExistingRule(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={newRuleInput}
                    onChange={(e) => setNewRuleInput(e.target.value)}
                    placeholder="Add a rule…"
                    className="h-7 flex-1 text-[11px]"
                    onKeyDown={(e) => e.key === "Enter" && addExistingRule()}
                  />
                  <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1" onClick={addExistingRule} disabled={!newRuleInput.trim()}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Emergency safety ═══════ */}
        <TabsContent value="emergency" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Siren className="h-3.5 w-3.5" /> Emergency safety rules
              </div>
              <p className="mb-3 text-[11px] text-muted-foreground">
                These rules protect patients in urgent situations. Emergency messages use <strong className="font-bold text-[oklch(0.62_0.16_42)]">bold text</strong> for accessibility.
              </p>
              <div className="space-y-2">
                {emergencyRules.map((r, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      r.enabled
                        ? "border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/5"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex-1">
                      <div className={`text-sm ${r.enabled ? "font-bold text-[oklch(0.62_0.16_42)]" : "font-medium text-muted-foreground"}`}>
                        <HeartPulse className="mr-2 inline h-4 w-4" />
                        {r.rule}
                      </div>
                      {r.enabled && (
                        <div className="mt-1 text-[11px] font-semibold text-[oklch(0.62_0.16_42)]">
                          ⚠ ACTIVE — This rule is enforced in real-time
                        </div>
                      )}
                    </div>
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={() => toggleEmergency(i)}
                      aria-label={`Toggle ${r.rule}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/5 p-4 text-xs">
                <div className="font-bold text-[oklch(0.62_0.16_42)]">
                  <AlertTriangle className="mr-1 inline h-3.5 w-3.5" /> Important safety notice
                </div>
                <p className="mt-1 text-muted-foreground">
                  Red-flag keywords include: <strong className="font-bold">chest pain, difficulty breathing, severe bleeding, numbness, swelling with fever</strong>.
                  When detected, the AI immediately stops normal conversation and escalates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Tool permissions ═══════ */}
        <TabsContent value="permissions" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Each permission supports four levels: Disabled, AI may suggest, Requires approval, AI may execute.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {toolMeta.map((t) => {
                  const Icon = t.icon;
                  const currentLevel = toolPermissions[t.key] ?? "suggest";
                  const levelMeta = permLevels.find((p) => p.value === currentLevel);
                  return (
                    <div key={t.key} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{t.name}</div>
                        <Select value={currentLevel} onValueChange={(v) => setToolPerm(t.key, v as "disabled" | "suggest" | "approval" | "execute")}>
                          <SelectTrigger className="mt-1 h-7 text-[11px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {permLevels.map((p) => (
                              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: levelMeta?.color }} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Handoff rules ═══════ */}
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
                  <Input
                    type="number"
                    value={maxFailedAttempts}
                    onChange={(e) => setMaxFailedAttempts(parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Escalation rules</div>
                {handoffRules.map((r, i) => (
                  <div key={i} className={`rounded-lg border border-border bg-muted/20 p-3 ${r.enabled ? "" : "opacity-50"}`}>
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">{r.rule}</div>
                      <Switch
                        checked={r.enabled}
                        onCheckedChange={() => toggleHandoff(i)}
                        aria-label={`Toggle ${r.rule}`}
                      />
                    </div>
                    {r.enabled && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3 text-[oklch(0.62_0.16_42)]" />
                        <span className="text-[11px] text-muted-foreground">→</span>
                        <Input
                          value={r.destination}
                          onChange={(e) => setHandoffDest(i, e.target.value)}
                          className="h-6 flex-1 border-0 bg-transparent p-0 text-[11px] shadow-none focus:ring-0"
                        />
                      </div>
                    )}
                    <div className="mt-1 flex justify-end">
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeHandoffRule(i)}>
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={newHandoffRule}
                    onChange={(e) => setNewHandoffRule(e.target.value)}
                    placeholder="Rule condition…"
                    className="h-7 flex-1 text-[11px]"
                  />
                  <Input
                    value={newHandoffDest}
                    onChange={(e) => setNewHandoffDest(e.target.value)}
                    placeholder="Destination…"
                    className="h-7 flex-1 text-[11px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] gap-1 shrink-0"
                    onClick={addHandoffRule}
                    disabled={!newHandoffRule.trim() || !newHandoffDest.trim()}
                  >
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══════ Channels ═══════ */}
        <TabsContent value="channels" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {channelMeta.map((c) => {
              const Icon = c.icon;
              const settings = channelSettings[c.id] ?? { enabled: true, greeting: "", responseLength: "medium", waitTime: "2s" };
              return (
                <Card key={c.id} className={`border-border bg-card ${!settings.enabled ? "opacity-50" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{c.id}</span>
                      </div>
                      <Switch
                        checked={settings.enabled}
                        onCheckedChange={(v) => updateChannelSetting(c.id, "enabled", v)}
                        aria-label={`Toggle ${c.id} channel`}
                      />
                    </div>
                    {settings.enabled && (
                      <>
                        <div className="mt-3">
                          <Label className="text-xs">Greeting</Label>
                          <Textarea
                            value={settings.greeting}
                            onChange={(e) => updateChannelSetting(c.id, "greeting", e.target.value)}
                            className="mt-1 text-xs"
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label className="text-[11px]">Response length</Label>
                            <Select
                              value={settings.responseLength}
                              onValueChange={(v) => updateChannelSetting(c.id, "responseLength", v)}
                            >
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
                            <Select
                              value={settings.waitTime}
                              onValueChange={(v) => updateChannelSetting(c.id, "waitTime", v)}
                            >
                              <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0s">Immediate</SelectItem>
                                <SelectItem value="2s">2 seconds</SelectItem>
                                <SelectItem value="5s">5 seconds</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══════ Voice ═══════ */}
        <TabsContent value="voice" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Voice selection</Label>
                  <Select value={voice} onValueChange={setVoice}>
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
                  <Select value={speakingSpeed} onValueChange={setSpeakingSpeed}>
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
                  <div className="mb-1 flex justify-between text-xs"><span>Warmth</span><span className="text-muted-foreground">{Math.round(warmth[0] / 10)}/10</span></div>
                  <Slider value={warmth} onValueChange={setWarmth} max={100} step={5} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Expressiveness</span><span className="text-muted-foreground">{Math.round(expressiveness[0] / 10)}/10</span></div>
                  <Slider value={expressiveness} onValueChange={setExpressiveness} max={100} step={5} />
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs"><span>Interruption sensitivity</span><span className="text-muted-foreground">{Math.round(interruptionSensitivity[0] / 10)}/10</span></div>
                  <Slider value={interruptionSensitivity} onValueChange={setInterruptionSensitivity} max={100} step={5} />
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
                <p className="mt-2 text-[11px] text-muted-foreground">&ldquo;{greeting}&rdquo;</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <span className="text-xs">Silence handling</span><Switch checked={true} onCheckedChange={() => {}} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                  <span className="text-xs">Background-noise handling</span><Switch checked={true} onCheckedChange={() => {}} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══════ Test playground ═══════ */}
        <TabsContent value="playground" className="mt-4">
          <TestPlayground />
        </TabsContent>
      </Tabs>
    </SectionScroll>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Test playground (keeps existing functionality)
// ═════════════════════════════════════════════════════════════════════════════

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
      const ai = generateDentalAIResponse(userMsg.text, channel, "New Caller");
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
