"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { contacts, team, appointments, conversations } from "@/data/demo";
import { ChannelIcon } from "../../shared/Channel";
import { timeAgo, formatDateTime, formatDay, timeOnly } from "../../shared/format";
import type { Contact, LeadStage } from "@/types/domain";
import {
  Search, Plus, Filter, Users, Mail, Phone, MessageCircle, MessageSquare,
  ChevronRight, Star, Building2, Tag, FileText, Calendar, History,
  ShieldCheck, AlertTriangle, Merge, Download, Trash2, X,
} from "lucide-react";

const leadStages: LeadStage[] = ["new", "qualified", "opportunity", "customer", "churned", "spam"];

export function ContactsSection() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<LeadStage | "all">("all");
  const [selectedId, setSelectedId] = useState(contacts[0].id);

  const filtered = contacts.filter((c) => {
    if (stage !== "all" && c.leadStage !== stage) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !(c.company?.name ?? "").toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const selected = contacts.find((c) => c.id === selectedId) ?? filtered[0];
  const owner = team.find((t) => t.id === selected?.ownerId);
  const upcoming = appointments.filter((a) => a.contactId === selected?.id);
  const convs = conversations.filter((cv) => cv.contactId === selected?.id);

  return (
    <SectionScroll>
      <PageHeader
        title="Contacts"
        subtitle="A lightweight CRM built around conversations, not forms."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
            <Button size="sm"><Plus className="h-3.5 w-3.5" /> New contact</Button>
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
                  placeholder="Search contacts…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setStage("all")}
                  className={`rounded-md px-2 py-1 text-[11px] ${stage === "all" ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                >
                  All
                </button>
                {leadStages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`rounded-md px-2 py-1 text-[11px] capitalize ${stage === s ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </CardContent>
            <div className="divide-y divide-border border-t border-border">
              {filtered.map((c) => (
                <ContactRow key={c.id} contact={c} active={selected?.id === c.id} onClick={() => setSelectedId(c.id)} />
              ))}
              {filtered.length === 0 && (
                <div className="p-6 text-center text-xs text-muted-foreground">No contacts found.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Profile */}
        <div className="lg:col-span-2">
          {selected && (
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback style={{ backgroundColor: selected.avatarColor, color: "white" }} className="text-lg">
                        {selected.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-serif text-2xl">{selected.name}</div>
                      {selected.company && (
                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" /> {selected.company.name} · {selected.company.industry}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px] capitalize">{selected.leadStage}</Badge>
                        {selected.tags.map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm"><Merge className="h-3.5 w-3.5" /> Merge</Button>
                    <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>
                  </div>
                </div>

                {/* Identities */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Connected identities</div>
                    <div className="space-y-1.5">
                      {selected.identities.map((id) => (
                        <div key={id.handle} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs">
                          <ChannelIcon id={id.channel} className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="flex-1 truncate">{id.handle}</span>
                          {id.verified && <Badge variant="outline" className="text-[9px] gap-0.5"><ShieldCheck className="h-2.5 w-2.5 text-[oklch(0.45_0.08_155)]" /> verified</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Ownership</div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback style={{ backgroundColor: owner.avatarColor, color: "white" }} className="text-[10px]">
                              {owner.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs font-medium">{owner.name}</div>
                            <div className="text-[10px] capitalize text-muted-foreground">{owner.role.replace("_", " ")}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Unassigned</div>
                      )}
                      {selected.company?.estimatedValue && (
                        <div className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
                          Estimated value: <span className="font-medium text-foreground">₹{selected.company.estimatedValue.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI summary */}
                <div className="mt-6 rounded-xl border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.04] p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium">
                    <Star className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" /> AI-generated summary
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{selected.aiSummary}</p>
                </div>

                {/* Unified timeline */}
                <div className="mt-6">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <History className="h-3.5 w-3.5" /> Unified timeline
                  </div>
                  <div className="space-y-3">
                    {[...convs]
                      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())
                      .map((c) => (
                        <div key={c.id} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                            <ChannelIcon id={c.channel} className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{c.subject}</span>
                              <span className="text-[10px] text-muted-foreground">{timeAgo(c.lastAt)}</span>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="capitalize">{c.channel}</span>
                              {c.aiHandling && <span className="text-[oklch(0.62_0.16_42)]">· AI handled</span>}
                              {c.hasAppointment && <span>· appointment</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    {upcoming.length > 0 && (
                      <div className="flex gap-3 rounded-lg border border-[oklch(0.45_0.08_155)]/20 bg-[oklch(0.45_0.08_155)]/[0.03] p-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{upcoming[0].title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDay(upcoming[0].startAt)} at {timeOnly(upcoming[0].startAt)} · {upcoming[0].type}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Consent & data */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <ShieldCheck className="h-3.5 w-3.5" /> Consent
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Call recording</span>
                        <Badge variant={selected.consent.recorded ? "default" : "outline"} className="text-[9px]">
                          {selected.consent.recorded ? "Given" : "Not given"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Marketing</span>
                        <Badge variant={selected.consent.marketing ? "default" : "outline"} className="text-[9px]">
                          {selected.consent.marketing ? "Opted in" : "Opted out"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" /> Data requests
                    </div>
                    <div className="space-y-2 text-xs">
                      <Button variant="outline" size="sm" className="h-7 w-full justify-start text-[11px]"><Download className="h-3 w-3" /> Export data</Button>
                      <Button variant="outline" size="sm" className="h-7 w-full justify-start text-[11px] text-[oklch(0.62_0.16_42)]"><Trash2 className="h-3 w-3" /> Request deletion</Button>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes</div>
                  <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm leading-relaxed text-foreground/80">
                    {selected.notes}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SectionScroll>
  );
}

function ContactRow({ contact, active, onClick }: { contact: Contact; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 p-3 text-left transition-colors ${active ? "bg-muted/60" : "hover:bg-muted/30"}`}
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback style={{ backgroundColor: contact.avatarColor, color: "white" }} className="text-[11px]">
          {contact.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="truncate text-sm font-medium">{contact.name}</span>
          <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(contact.lastInteraction)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ChannelIcon id={contact.primaryChannel} className="h-3 w-3" />
          <span className="truncate">{contact.company?.name ?? "—"}</span>
        </div>
      </div>
    </button>
  );
}
