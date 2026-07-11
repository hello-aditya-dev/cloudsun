"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { appointments, team } from "@/data/demo";
import { ChannelIcon } from "../../shared/Channel";
import { timeOnly, formatDay } from "../../shared/format";
import type { Appointment } from "@/types/domain";
import {
  CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, MapPin,
  Video, User, Calendar as CalIcon, X,
} from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function CalendarSection() {
  const [view, setView] = useState<"week" | "day" | "agenda">("week");
  const [selected, setSelected] = useState<Appointment | null>(null);

  // Use the week of July 13 (Monday) for demo
  const weekStart = new Date("2026-07-13T00:00:00+05:30");
  const weekDates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  function apptOnDay(date: Date) {
    return appointments.filter((a) => {
      const ad = new Date(a.startAt);
      return ad.toDateString() === date.toDateString();
    });
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Calendar"
        subtitle="Day, week and agenda views with booking source, channel and assignee."
        action={
          <div className="flex gap-2">
            <div className="flex rounded-lg border border-border bg-card p-0.5">
              {(["week", "day", "agenda"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`rounded-md px-3 py-1 text-xs capitalize ${view === v ? "bg-muted font-medium" : "text-muted-foreground"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <Button size="sm"><Plus className="h-3.5 w-3.5" /> New appointment</Button>
          </div>
        }
      />

      {view === "agenda" ? (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...appointments]
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/30"
                  >
                    <div className="flex w-16 flex-col items-center rounded-lg border border-border bg-muted/20 py-2">
                      <div className="text-[10px] uppercase text-muted-foreground">{formatDay(a.startAt).slice(0, 3)}</div>
                      <div className="font-serif text-xl leading-none">{new Date(a.startAt).getDate()}</div>
                      <div className="text-[10px] text-muted-foreground">{timeOnly(a.startAt)}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{a.contactName} · {a.type}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <ChannelIcon id={a.channel} className="h-3 w-3" />
                        <span className="capitalize">via {a.channel}</span>
                        {a.location && <><span>·</span><MapPin className="h-3 w-3" />{a.location}</>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{a.status}</Badge>
                  </button>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : view === "day" ? (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <DayView date={weekDates[2]} appts={apptOnDay(weekDates[2])} onSelect={setSelected} />
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                July 13 – 19, 2026
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px]">Today</Button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((d, i) => {
                const isToday = d.toDateString() === new Date("2026-07-11T13:30:00+05:30").toDateString();
                const appts = apptOnDay(d);
                return (
                  <div key={i} className="text-center">
                    <div className="text-[10px] uppercase text-muted-foreground">{days[i]}</div>
                    <div className={`mt-0.5 font-serif text-lg ${isToday ? "text-[oklch(0.62_0.16_42)]" : ""}`}>
                      {d.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {weekDates.map((d, i) => {
                const appts = apptOnDay(d);
                return (
                  <div key={i} className="min-h-[180px] space-y-1 rounded-lg border border-border bg-muted/20 p-1.5">
                    {appts.map((a) => {
                      const ch = a.channel;
                      const colorMap: Record<string, string> = {
                        phone: "oklch(0.62 0.16 42)",
                        email: "oklch(0.45 0.08 155)",
                        whatsapp: "oklch(0.55 0.14 150)",
                        webchat: "oklch(0.50 0.10 250)",
                      };
                      return (
                        <button
                          key={a.id}
                          onClick={() => setSelected(a)}
                          className="block w-full rounded-md px-1.5 py-1 text-left text-[10px] text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: colorMap[ch] }}
                        >
                          <div className="font-medium">{timeOnly(a.startAt)}</div>
                          <div className="truncate opacity-90">{a.title}</div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Working hours + booking types */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Working hours
            </div>
            <div className="space-y-1.5 text-xs">
              {["Mon – Fri", "Saturday", "Sunday"].map((d, i) => (
                <div key={d} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-1.5">
                  <span className="text-muted-foreground">{d}</span>
                  <span>{i === 0 ? "9:00 – 18:00" : i === 1 ? "10:00 – 14:00" : "Closed"}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>Buffer:</span><Badge variant="outline" className="text-[10px]">15 min</Badge>
              <span>·</span>
              <span>Timezone:</span><Badge variant="outline" className="text-[10px]">Asia/Calcutta</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalIcon className="h-3.5 w-3.5" /> Booking types
            </div>
            <div className="space-y-1.5 text-xs">
              {[
                { name: "Consultation", dur: "45 min" },
                { name: "Follow-up", dur: "30 min" },
                { name: "Strategy", dur: "60 min" },
                { name: "Trial", dur: "60 min" },
              ].map((t) => (
                <div key={t.name} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-1.5">
                  <span>{t.name}</span>
                  <span className="text-muted-foreground">{t.dur}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <Card className="relative z-10 w-full max-w-md border-border bg-card shadow-lift">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-serif text-lg">{selected.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{selected.contactName}</div>
                </div>
                <button onClick={() => setSelected(null)} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /> {formatDay(selected.startAt)}, {timeOnly(selected.startAt)} – {timeOnly(selected.endAt)}</div>
                <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> Assigned to {team.find((t) => t.id === selected.assigneeId)?.name ?? "—"}</div>
                <div className="flex items-center gap-2"><ChannelIcon id={selected.channel} className="h-3.5 w-3.5 text-muted-foreground" /> Booked via {selected.channel}</div>
                {selected.location && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selected.location}</div>}
                <div className="flex items-center gap-2"><Video className="h-3.5 w-3.5 text-muted-foreground" /> Google Meet link attached</div>
              </div>
              {selected.notes && (
                <div className="mt-3 rounded-lg border border-border bg-muted/20 p-2.5 text-xs text-foreground/80">{selected.notes}</div>
              )}
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Reschedule</Button>
                <Button variant="outline" size="sm" className="flex-1 text-[oklch(0.62_0.16_42)]">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </SectionScroll>
  );
}

function DayView({ date, appts, onSelect }: { date: Date; appts: Appointment[]; onSelect: (a: Appointment) => void }) {
  return (
    <div>
      <div className="mb-3 text-sm font-medium">{date.toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</div>
      <div className="space-y-1">
        {hours.map((h) => {
          const hourAppts = appts.filter((a) => new Date(a.startAt).getHours() === h);
          return (
            <div key={h} className="flex gap-3">
              <div className="w-12 shrink-0 py-1 text-[10px] text-muted-foreground">
                {h > 12 ? h - 12 : h}{h >= 12 ? " PM" : " AM"}
              </div>
              <div className="min-h-[48px] flex-1 border-t border-border/60 py-1">
                {hourAppts.map((a) => {
                  const colorMap: Record<string, string> = {
                    phone: "oklch(0.62 0.16 42)",
                    email: "oklch(0.45 0.08 155)",
                    whatsapp: "oklch(0.55 0.14 150)",
                    webchat: "oklch(0.50 0.10 250)",
                  };
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className="mb-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs text-white"
                      style={{ backgroundColor: colorMap[a.channel] }}
                    >
                      <div>
                        <div className="font-medium">{timeOnly(a.startAt)} · {a.title}</div>
                        <div className="opacity-90">{a.contactName}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
