"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useDemoState } from "@/hooks/use-demo-state";
import { demoContacts } from "@/lib/repositories";
import { timeAgo } from "../../shared/format";
import {
  ArrowLeft, Phone, Mail, MessageCircle, MessageSquare, Calendar,
  CheckCircle2, ShieldCheck, FileText, History, Clock, AlertTriangle, Star,
} from "lucide-react";

export function PatientDetailSection() {
  const params = useParams<{ patientId: string }>();
  const patientId = params?.patientId;
  const state = useDemoState();
  const [noteInput, setNoteInput] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const patient = patientId ? state.contacts.find((c) => c.id === patientId) : undefined;

  if (!patient) {
    return (
      <SectionScroll>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="font-serif text-4xl text-muted-foreground/40">404</div>
          <h2 className="mt-2 font-serif text-xl">Patient not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">This patient ID does not exist in the demo workspace.</p>
          <Link href="/app/patients" className="mt-4"><Button>Back to patients</Button></Link>
        </div>
      </SectionScroll>
    );
  }

  const conversations = state.conversations.filter((c) => c.contactId === patient.id);
  const appointments = state.appointments.filter((a) => a.contactId === patient.id);
  const calls = state.calls.filter((c) => c.contactId === patient.id);
  const recallCases = state.recallCases.filter((r) => r.patientId === patient.id);
  const waitlistEntries = state.waitlist.filter((w) => w.patientId === patient.id);
  const treatmentFollowUps = state.treatmentFollowUps.filter((t) => t.patientId === patient.id);
  const auditEntries = state.auditLog.filter((a) => a.resource.includes(patient.id));

  function saveNote() {
    if (!noteInput.trim()) return;
    demoContacts.addNote(patient!.id, noteInput);
    setNoteInput("");
  }

  return (
    <SectionScroll>
      <div className="mb-4">
        <Link href="/app/patients" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to patients
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback style={{ backgroundColor: patient.avatarColor, color: "white" }} className="text-lg">
              {patient.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-serif text-2xl">{patient.name}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              {patient.patientStatus === "new_lead" ? "New lead" : patient.patientStatus === "new_patient" ? "New patient" : "Existing patient"}
              {patient.preferredLocation && ` · ${patient.preferredLocation}`}
              {patient.preferredDentist && ` · ${patient.preferredDentist}`}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="text-[10px] capitalize">{patient.patientStatus.replace(/_/g, " ")}</Badge>
              <Badge variant="outline" className="text-[10px] capitalize">{patient.recallStatus.replace(/_/g, " ")}</Badge>
              {patient.insuranceProvider && <Badge variant="secondary" className="text-[10px]">{patient.insuranceProvider}</Badge>}
              {patient.paymentType && <Badge variant="secondary" className="text-[10px] capitalize">{patient.paymentType.replace(/_/g, " ")}</Badge>}
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/40 flex-wrap">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="conversations" className="text-xs">Conversations</TabsTrigger>
          <TabsTrigger value="appointments" className="text-xs">Appointments</TabsTrigger>
          <TabsTrigger value="calls" className="text-xs">Calls</TabsTrigger>
          <TabsTrigger value="recall" className="text-xs">Recall</TabsTrigger>
          <TabsTrigger value="waitlist" className="text-xs">Waitlist</TabsTrigger>
          <TabsTrigger value="treatment" className="text-xs">Treatment</TabsTrigger>
          <TabsTrigger value="consent" className="text-xs">Consent</TabsTrigger>
          <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact information</div>
                  {patient.identities.map((id) => (
                    <div key={`${id.channel}-${id.handle}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                      {id.channel === "phone" && <Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                      {id.channel === "email" && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                      {id.channel === "whatsapp" && <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                      {id.channel === "webchat" && <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
                      <span className="flex-1 truncate">{id.handle}</span>
                      {id.verified && <CheckCircle2 className="h-3 w-3 text-[oklch(0.45_0.08_155)]" />}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dental information</div>
                  <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Patient status</span><span className="capitalize">{patient.patientStatus.replace(/_/g, " ")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Preferred location</span><span>{patient.preferredLocation ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Preferred dentist</span><span>{patient.preferredDentist ?? "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>{patient.insuranceProvider ?? "Self-pay"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Payment type</span><span className="capitalize">{(patient.paymentType ?? "self_pay").replace(/_/g, " ")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Last visit</span><span>{patient.lastVisitAt ? timeAgo(patient.lastVisitAt) : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Recall status</span><span className="capitalize">{patient.recallStatus.replace(/_/g, " ")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Treatment follow-up</span><span className="capitalize">{patient.treatmentFollowUpStatus.replace(/_/g, " ")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Date of birth</span><span>{patient.dateOfBirthMasked ?? "—"}</span></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                  <Star className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" /> AI summary (simulated)
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{patient.aiSummary}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/app/calendar"><Button variant="outline" size="sm"><Calendar className="h-3.5 w-3.5" /> Book appointment</Button></Link>
                <Link href="/app/recall"><Button variant="outline" size="sm"><History className="h-3.5 w-3.5" /> View recall</Button></Link>
                <Link href="/app/treatment-follow-up"><Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5" /> Treatment follow-up</Button></Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversations" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No conversations found.</div>
                ) : conversations.map((c) => (
                  <Link key={c.id} href={`/app/inbox/${c.id}`} className="flex items-center gap-3 p-4 hover:bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{c.subject}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.preview}</div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(c.lastAt)}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {appointments.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No appointments found.</div>
                ) : appointments.map((a) => (
                  <div key={a.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{a.title}</span>
                      <Badge variant="outline" className="text-[9px] capitalize">{a.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {new Date(a.startAt).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                      {a.location && ` · ${a.location}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calls" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {calls.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No calls found.</div>
                ) : calls.map((c) => (
                  <div key={c.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{c.direction} call</span>
                      <Badge variant="outline" className="text-[9px]">{c.handler === "ai" ? "AI" : "Human"}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{c.phone} · {timeAgo(c.startedAt)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recall" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recallCases.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No recall cases found.</div>
                ) : recallCases.map((r) => (
                  <div key={r.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{r.status.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(r.recallDue)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{r.outcome} · {r.nextAction}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waitlist" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {waitlistEntries.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Not on waitlist.</div>
                ) : waitlistEntries.map((w) => (
                  <div key={w.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{w.appointmentType}</span>
                      <Badge variant="outline" className="text-[9px] capitalize">{w.acceptanceState}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{w.preferredLocation} · {w.availability}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {treatmentFollowUps.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No treatment follow-ups found.</div>
                ) : treatmentFollowUps.map((t) => (
                  <div key={t.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t.treatmentType}</span>
                      <Badge variant="outline" className="text-[9px] capitalize">{t.stage.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">Est. value: ${t.estimatedValue} · {t.nextAction}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
                <span>Call recording consent</span>
                <Badge variant={patient.consent.recorded ? "default" : "outline"} className="text-[10px]">{patient.consent.recorded ? "Given" : "Not given"}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
                <span>Marketing communication consent</span>
                <Badge variant={patient.consent.marketing ? "default" : "outline"} className="text-[10px]">{patient.consent.marketing ? "Given" : "Not given"}</Badge>
              </div>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm">
                <span>Do not contact</span>
                <Badge variant={patient.recallStatus === "do_not_contact" ? "destructive" : "outline"} className="text-[10px]">{patient.recallStatus === "do_not_contact" ? "Yes" : "No"}</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 rounded-lg border border-border bg-muted/20 p-3 text-sm leading-relaxed text-foreground/80">
                {patient.notes || "No notes yet."}
              </div>
              <div className="flex gap-2">
                <Input value={noteInput} onChange={(e) => setNoteInput(e.target.value)} placeholder="Add a note…" className="text-xs" />
                <Button size="sm" onClick={saveNote} disabled={!noteInput.trim()}>Add note</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {auditEntries.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">No audit entries found.</div>
                ) : auditEntries.map((a) => (
                  <div key={a.id} className="p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{a.action}</span>
                      <span className="text-[10px] text-muted-foreground">{timeAgo(a.at)}</span>
                    </div>
                    <div className="mt-0.5 text-muted-foreground">{a.resource} · {a.details ?? ""}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SectionScroll>
  );
}
