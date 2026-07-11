"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { team, integrations, auditLog, analytics, workspace } from "@/data/demo";
import { integrationCatalog } from "@/config/cloudsun";
import { Icon } from "../../shared/Icon";
import { timeAgo, formatDateTime } from "../../shared/format";
import {
  Plus, Mail, CheckCircle2, AlertTriangle, XCircle, Clock, Shield,
  Lock, KeyRound, ScrollText, FileCheck, Smartphone, Monitor, Globe,
  CreditCard, Download, Receipt, TrendingUp, UserPlus, Webhook,
} from "lucide-react";

/* ------------------------------- TEAM ---------------------------------- */
export function TeamSection() {
  return (
    <SectionScroll>
      <PageHeader
        title="Team"
        subtitle="Roles, availability, skills and assignment rules."
        action={<Button size="sm"><UserPlus className="h-3.5 w-3.5" /> Invite</Button>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <div className="col-span-4">Member</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Availability</div>
              <div className="col-span-2">Capacity</div>
              <div className="col-span-2">Skills</div>
            </div>
            <div className="divide-y divide-border">
              {team.map((m) => (
                <div key={m.id} className="grid grid-cols-12 items-center gap-2 px-4 py-3 text-xs">
                  <div className="col-span-4 flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback style={{ backgroundColor: m.avatarColor, color: "white" }} className="text-[10px]">
                        {m.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{m.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2 capitalize">{m.role.replace("_", " ")}</div>
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${m.availability === "available" ? "bg-[oklch(0.45_0.08_155)]" : m.availability === "busy" ? "bg-[oklch(0.62_0.16_42)]" : m.availability === "away" ? "bg-[oklch(0.70_0.12_75)]" : "bg-muted-foreground/30"}`} />
                    <span className="capitalize">{m.availability}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(m.capacity.current / m.capacity.max) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m.capacity.current}/{m.capacity.max}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {m.skills.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary" className="text-[9px]">{s}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Roles & permissions</div>
              <div className="space-y-1.5 text-xs">
                {[
                  { role: "Owner", perms: "Full access" },
                  { role: "Administrator", perms: "All except billing" },
                  { role: "Manager", perms: "Team + inbox" },
                  { role: "Agent", perms: "Inbox + calls" },
                  { role: "Analyst", perms: "Analytics read-only" },
                  { role: "Read-only", perms: "View only" },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                    <span className="font-medium">{r.role}</span>
                    <span className="text-[10px] text-muted-foreground">{r.perms}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assignment rules</div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                  <span>Round-robin</span><Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                  <span>By skill match</span><Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                  <span>By language</span><Switch />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-2.5 py-1.5">
                  <span>VIP → owner</span><Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionScroll>
  );
}

/* --------------------------- INTEGRATIONS ------------------------------ */
export function IntegrationsSection() {
  const [filter, setFilter] = useState("all");
  const cats = ["all", "Practice Management", "Communication", "Calendar", "Meetings", "Payments", "Automation"];
  const filtered = filter === "all" ? integrationCatalog : integrationCatalog.filter((i) => i.category === filter);

  const statusMeta: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
    connected: { color: "oklch(0.45 0.08 155)", label: "Connected", icon: CheckCircle2 },
    demo: { color: "oklch(0.70 0.12 75)", label: "Interactive demo", icon: CheckCircle2 },
    planned: { color: "oklch(0.65 0.05 250)", label: "Planned", icon: Clock },
    sync_delayed: { color: "oklch(0.70 0.12 75)", label: "Sync delayed", icon: Clock },
    reauth: { color: "oklch(0.62 0.16 42)", label: "Reauthorization required", icon: AlertTriangle },
    error: { color: "oklch(0.62 0.16 42)", label: "Error", icon: XCircle },
    not_connected: { color: "oklch(0.5 0 0)", label: "Not connected", icon: Plus },
    connecting: { color: "oklch(0.70 0.12 75)", label: "Connecting…", icon: Clock },
    disabled: { color: "oklch(0.5 0 0)", label: "Disabled", icon: XCircle },
  };

  return (
    <SectionScroll>
      <PageHeader
        title="Integrations"
        subtitle="Real status on every integration. No faked live connections."
      />

      <div className="mb-4 flex flex-wrap gap-1">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-md px-3 py-1 text-xs ${filter === c ? "bg-muted font-medium" : "text-muted-foreground hover:bg-muted/50"}`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const integ = integrations.find((i) => i.name.includes(item.name)) ?? integrations.find((i) => i.name === item.name);
          const status = integ?.status ?? item.status ?? "not_connected";
          const meta = statusMeta[status] ?? statusMeta.not_connected;
          const StatusIcon = meta.icon;
          return (
            <Card key={item.name} className="border-border bg-card transition-all hover:shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="gap-1 text-[9px]" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
                    <StatusIcon className="h-2.5 w-2.5" /> {meta.label}
                  </Badge>
                </div>
                <div className="mt-3 text-sm font-medium">{item.name}</div>
                <div className="text-[11px] text-muted-foreground">{item.category}</div>
                {integ?.lastSync && (
                  <div className="mt-1 text-[10px] text-muted-foreground">Synced {timeAgo(integ.lastSync)}</div>
                )}
                <div className="mt-3 flex gap-1.5 border-t border-border pt-3">
                  {status === "connected" ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-[11px]">Configure</Button>
                      <Button variant="ghost" size="sm" className="text-[11px] text-[oklch(0.62_0.16_42)]">Disconnect</Button>
                    </>
                  ) : status === "reauth" || status === "error" ? (
                    <Button size="sm" className="flex-1 text-[11px]">Reconnect</Button>
                  ) : (
                    <Button size="sm" className="flex-1 text-[11px]">Connect</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.03]">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-[oklch(0.62_0.16_42)]" />
            Secret tokens are never displayed after they&apos;ve been saved. Reconnect to refresh authorization.
          </div>
        </CardContent>
      </Card>
    </SectionScroll>
  );
}

/* ----------------------------- SETTINGS -------------------------------- */
export function SettingsSection() {
  return (
    <SectionScroll>
      <PageHeader title="Settings" subtitle="Workspace, notifications, security and channels." />

      <Tabs defaultValue="general">
        <TabsList className="bg-muted/40">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="channels" className="text-xs">Channels</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="space-y-4 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Workspace name</Label>
                  <Input defaultValue={workspace.name} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Plan</Label>
                  <Input defaultValue={workspace.plan} disabled className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Timezone</Label>
                  <Input defaultValue={workspace.timezone} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Default language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button size="sm">Save changes</Button>

              <div className="mt-6 border-t border-border pt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo workspace</div>
                <p className="mb-3 text-xs text-muted-foreground">
                  All demo changes (sent messages, notes, assignments, AI configuration) are saved locally in your browser. Resetting restores the original seeded state and deletes your local changes.
                </p>
                <ResetDemoButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { name: "Phone", status: "demo", note: "Demo telephony active. Bring your own Twilio numbers in production." },
              { name: "Email (Gmail)", status: "not_connected", note: "Provider not connected. Configure in Integrations." },
              { name: "WhatsApp Business", status: "not_connected", note: "Provider not connected. Configure in Integrations." },
              { name: "Website chat", status: "demo", note: "Interactive demo. Embeddable widget not deployed." },
            ].map((c) => (
              <Card key={c.name} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{c.name}</span>
                    <Badge variant="outline" className="text-[9px] capitalize">{c.status}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{c.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="border-border bg-card">
            <CardContent className="space-y-1 p-6">
              {[
                "New urgent conversation",
                "SLA breach",
                "AI handoff requested",
                "New lead arrives",
                "Appointment booked",
                "Integration error",
                "Daily summary email",
              ].map((n) => (
                <div key={n} className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-muted/30">
                  <span>{n}</span>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <label className="flex items-center gap-1"><Switch defaultChecked /> Email</label>
                    <label className="flex items-center gap-1"><Switch defaultChecked /> Slack</label>
                    <label className="flex items-center gap-1"><Switch /> Push</label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Authentication</div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><div><span>Two-factor authentication</span><div className="text-[10px] text-muted-foreground">Requires authentication integration</div></div><Badge variant="outline" className="text-[9px]">Not configured</Badge></div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><div><span>Single sign-on (SSO)</span><div className="text-[10px] text-muted-foreground">Requires Organization plan</div></div><Badge variant="outline" className="text-[9px]">Not configured</Badge></div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><div><span>IP allowlist</span><div className="text-[10px] text-muted-foreground">Requires Organization plan</div></div><Badge variant="outline" className="text-[9px]">Placeholder</Badge></div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><FileCheck className="h-3.5 w-3.5" /> Data & retention</div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><span>Call recording retention</span><Badge variant="outline" className="text-[9px]">90 days</Badge></div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><div><span>PII masking</span><div className="text-[10px] text-muted-foreground">Demonstration setting</div></div><Badge variant="outline" className="text-[9px]">Demo</Badge></div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"><div><span>Webhook signing</span><div className="text-[10px] text-muted-foreground">Demonstration setting</div></div><Badge variant="outline" className="text-[9px]">Demo</Badge></div>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-4 border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Smartphone className="h-3.5 w-3.5" /> Active sessions</div>
              <div className="space-y-2 text-xs">
                {[
                  { device: "MacBook Pro · Chrome", ip: "203.0.113.42", loc: "Mumbai, IN", current: true },
                  { device: "iPhone 15 · Safari", ip: "203.0.113.91", loc: "Mumbai, IN", current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2">
                    <div>
                      <div className="font-medium">{s.device} {s.current && <Badge className="ml-1 text-[9px]">Current</Badge>}</div>
                      <div className="text-[10px] text-muted-foreground">{s.ip} · {s.loc}</div>
                    </div>
                    {!s.current && <Button variant="ghost" size="sm" className="text-[11px] text-[oklch(0.62_0.16_42)]">Revoke</Button>}
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

/* ------------------------------ BILLING -------------------------------- */
export function BillingSection() {
  return (
    <SectionScroll>
      <PageHeader title="Billing" subtitle="Plan, usage and invoices." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
                <div className="mt-1 font-serif text-2xl">{workspace.plan}</div>
                <div className="text-xs text-muted-foreground">$149 / month · renews Aug 11, 2026</div>
              </div>
              <Button size="sm" disabled title="No payment method connected in demo mode">Manage plan</Button>
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: "AI conversations", used: 1842, max: 3000 },
                { label: "Phone minutes", used: 412, max: 1000 },
                { label: "Knowledge sources", used: 8, max: 50 },
                { label: "Team seats", used: 5, max: 10 },
              ].map((u) => (
                <div key={u.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">{u.label}</span>
                    <span>{u.used.toLocaleString()} / {u.max.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-[oklch(0.62_0.16_42)]" style={{ width: `${(u.used / u.max) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">This month</div>
            <div className="mt-1 font-serif text-3xl">$2,650</div>
            <div className="mt-1 text-xs text-muted-foreground">$1,490 base + $1,160 usage</div>
            <div className="mt-4 space-y-1.5 text-xs">
              {analytics.monthlyCost.map((c) => (
                <div key={c.category} className="flex justify-between"><span className="text-muted-foreground">{c.category}</span><span>${c.amount}</span></div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full"><Download className="h-3.5 w-3.5" /> Download invoice</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 border-border bg-card">
        <CardContent className="p-0">
          <div className="border-b border-border bg-muted/30 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent invoices <span className="ml-2 font-normal normal-case text-[10px]">(demonstration)</span></div>
          <div className="divide-y divide-border">
            {[
              { id: "INV-2026-07", date: "Jul 11, 2026", amount: "$2,650", status: "Due" },
              { id: "INV-2026-06", date: "Jun 11, 2026", amount: "$2,210", status: "Paid" },
              { id: "INV-2026-05", date: "May 11, 2026", amount: "$1,890", status: "Paid" },
              { id: "INV-2026-04", date: "Apr 11, 2026", amount: "$1,490", status: "Paid" },
            ].map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3 text-xs">
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{inv.id}</div>
                    <div className="text-[10px] text-muted-foreground">{inv.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span>{inv.amount}</span>
                  <Badge variant={inv.status === "Paid" ? "outline" : "secondary"} className="text-[9px]">{inv.status}</Badge>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px]"><Download className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SectionScroll>
  );
}

/* ---------------------------- AUDIT LOG -------------------------------- */
export function AuditLogSection() {
  return (
    <SectionScroll>
      <PageHeader
        title="Audit log"
        subtitle="Every action by humans and AI, retained and exportable."
        action={<Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" /> Export</Button>}
      />

      <Card className="border-border bg-card">
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b border-border bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <div className="col-span-2">Actor</div>
            <div className="col-span-3">Action</div>
            <div className="col-span-3">Resource</div>
            <div className="col-span-2">Source</div>
            <div className="col-span-1">Result</div>
            <div className="col-span-1">When</div>
          </div>
          <div className="divide-y divide-border">
            {auditLog.map((a) => (
              <div key={a.id} className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 text-xs">
                <div className="col-span-2 flex items-center gap-2">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] ${a.actorType === "ai" ? "bg-[oklch(0.62_0.16_42)]/10 text-[oklch(0.62_0.16_42)]" : a.actorType === "system" ? "bg-muted text-muted-foreground" : "bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]"}`}>
                    {a.actorType === "ai" ? <KeyRound className="h-3 w-3" /> : a.actorType === "system" ? <Globe className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium">{a.actor}</div>
                    <div className="text-[9px] capitalize text-muted-foreground">{a.actorType}</div>
                  </div>
                </div>
                <div className="col-span-3 truncate">{a.action}</div>
                <div className="col-span-3 truncate text-muted-foreground">{a.resource}</div>
                <div className="col-span-2 truncate text-[10px] text-muted-foreground">{a.ip}</div>
                <div className="col-span-1">
                  <span className={`inline-block h-2 w-2 rounded-full ${a.result === "success" ? "bg-[oklch(0.45_0.08_155)]" : a.result === "failure" ? "bg-[oklch(0.62_0.16_42)]" : "bg-[oklch(0.70_0.12_75)]"}`} />
                </div>
                <div className="col-span-1 text-[10px] text-muted-foreground">{timeAgo(a.at)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-[11px] text-muted-foreground">
        Retention: 90 days on Practice plan. Upgrade to Organization for 1-year retention.
      </p>
    </SectionScroll>
  );
}

/* ----------------------- Reset demo workspace ----------------------------- */
function ResetDemoButton() {
  const [confirming, setConfirming] = useState(false);
  function reset() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("cloudsun.demo.v1");
      window.location.reload();
    }
  }
  if (!confirming) {
    return <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>Reset demonstration workspace</Button>;
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[oklch(0.62_0.16_42)]">This deletes all local demo changes. Continue?</span>
      <Button variant="destructive" size="sm" onClick={reset}>Yes, reset</Button>
      <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
    </div>
  );
}
