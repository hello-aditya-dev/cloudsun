"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDemoState } from "@/hooks/use-demo-state";
import { demoContacts } from "@/lib/repositories";
import { timeAgo } from "../../shared/format";
import type { Contact } from "@/types/domain";
import {
  Search, Plus, Download, Users, Phone, Mail, MessageCircle, MessageSquare,
  CheckCircle2, ShieldCheck, Calendar, FileText, History, Star, Tag,
} from "lucide-react";

const leadStages = ["all", "new", "qualified", "opportunity", "customer", "churned", "spam"];

export function PatientsSection() {
  const state = useDemoState();
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("all");
  const [selectedId, setSelectedId] = useState(state.contacts[0]?.id ?? "");

  const filtered = state.contacts.filter((c) => {
    if (stage !== "all" && c.leadStage !== stage) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = state.contacts.find((c) => c.id === selectedId) ?? filtered[0];

  return (
    <SectionScroll>
      <PageHeader
        title="Patients & Leads"
        subtitle="Dental-specific patient and lead management. All data is fictional demonstration data."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
            <Button size="sm"><Plus className="h-3.5 w-3.5" /> New patient</Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List */}
        <div className="lg:col-span-1">
          <Card className="border-border bg-card">
            <CardContent className="p-3">
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search patients…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {leadStages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`rounded-md px-2 py-1 text-[11px] capitalize ${stage === s ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </CardContent>
            <div className="divide-y divide-border border-t border-border max-h-[600px] overflow-y-auto scroll-thin">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${selected?.id === c.id ? "bg-muted/60" : "hover:bg-muted/30"}`}
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback style={{ backgroundColor: c.avatarColor, color: "white" }} className="text-[11px]">
                      {c.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">{c.name}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(c.lastInteraction)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="capitalize">{c.tags.includes("new-patient") ? "New" : "Existing"}</span>
                      <span>·</span>
                      <span className="capitalize">{c.leadStage}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Profile */}
        <div className="lg:col-span-2">
          {selected && <PatientProfile contact={selected} />}
        </div>
      </div>
    </SectionScroll>
  );
}

function PatientProfile({ contact }: { contact: Contact }) {
  const [noteInput, setNoteInput] = useState("");

  function saveNote() {
    if (!noteInput.trim()) return;
    demoContacts.addNote(contact.id, noteInput);
    setNoteInput("");
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback style={{ backgroundColor: contact.avatarColor, color: "white" }} className="text-lg">
                {contact.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-serif text-2xl">{contact.name}</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                {contact.tags.includes("new-patient") ? "New patient" : "Existing patient"} · {contact.tags.find((t) => t.includes("recall")) ? "Recall due" : ""}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-[10px] capitalize">{contact.leadStage}</Badge>
                {contact.tags.slice(0, 3).map((t) => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Identities */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact information</div>
            {contact.identities.map((id) => (
              <div key={`${id.channel}-${id.handle}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                {id.channel === "phone" && <Phone className="h-3.5 w-3.5 text-muted-foreground" />}
                {id.channel === "email" && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                {id.channel === "whatsapp" && <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                {id.channel === "webchat" && <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="flex-1 truncate">{id.handle}</span>
                {id.verified && <Badge variant="outline" className="gap-0.5 text-[9px]"><ShieldCheck className="h-2.5 w-2.5 text-[oklch(0.45_0.08_155)]" /> verified</Badge>}
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dental information</div>
            <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Preferred location</span><span>{contact.tags.find((t) => t.includes("location")) ?? "Central"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient type</span><span>{contact.tags.includes("new-patient") ? "New" : "Existing"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>{contact.notes.includes("Insured") ? "Insured" : "Self-pay"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Consent</span><span>{contact.consent.recorded ? "Recorded" : "Not recorded"}</span></div>
            </div>
          </div>
        </div>

        {/* AI summary */}
        <div className="mt-6 rounded-xl border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium">
            <Star className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" /> AI summary (simulated)
          </div>
          <p className="text-sm leading-relaxed text-foreground/80">{contact.aiSummary}</p>
        </div>

        {/* Tags */}
        <div className="mt-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Tags</div>
          <div className="flex flex-wrap gap-1.5">
            {contact.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Internal notes</div>
          <div className="mb-2 rounded-lg border border-border bg-muted/20 p-3 text-sm leading-relaxed text-foreground/80">
            {contact.notes}
          </div>
          <div className="flex gap-2">
            <Input
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Add a note…"
              className="text-xs"
            />
            <Button size="sm" onClick={saveNote} disabled={!noteInput.trim()}>Add note</Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          <Link href="/app/calendar"><Button variant="outline" size="sm"><Calendar className="h-3.5 w-3.5" /> Book appointment</Button></Link>
          <Link href="/app/recall"><Button variant="outline" size="sm"><History className="h-3.5 w-3.5" /> View recall</Button></Link>
          <Link href="/app/treatment-follow-up"><Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5" /> Treatment follow-up</Button></Link>
        </div>
      </CardContent>
    </Card>
  );
}
