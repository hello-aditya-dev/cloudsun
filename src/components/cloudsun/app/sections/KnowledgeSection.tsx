"use client";

import { useState } from "react";
import { SectionScroll, PageHeader } from "../SectionScroll";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { knowledgeSources } from "@/data/demo";
import { channelList } from "@/config/cloudsun";
import { ChannelIcon } from "../../shared/Channel";
import { timeAgo } from "../../shared/format";
import {
  Plus, Search, FileText, Globe, Link as LinkIcon, FileType, BookOpen,
  Database, MessageCircleQuestion, RefreshCw, Trash2, Edit3, AlertTriangle,
  CheckCircle2, Loader2, Sparkles, Send, X,
} from "lucide-react";

const typeIcons: Record<string, typeof FileText> = {
  website: Globe,
  sitemap: Globe,
  url: LinkIcon,
  pdf: FileText,
  document: FileType,
  text: FileText,
  faq: MessageCircleQuestion,
  notion: BookOpen,
  drive: Database,
  manual: Edit3,
};

export function KnowledgeSection() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function ask() {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    setTimeout(() => {
      setAnswer("Yes — the couples package is two 60-minute sessions per month at ₹4,800. New clients can add a 30-minute trial for ₹1,200. The package can be shared between two people at the same address.");
      setLoading(false);
    }, 1000);
  }

  return (
    <SectionScroll>
      <PageHeader
        title="Knowledge"
        subtitle="The sources your AI answers from. Honest about gaps, citations on every answer."
        action={<Button size="sm"><Plus className="h-3.5 w-3.5" /> Add source</Button>}
      />

      {/* Test question */}
      <Card className="mb-6 border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.03]">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[oklch(0.62_0.16_42)]">
            <Sparkles className="h-3.5 w-3.5" /> Test a question
          </div>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="e.g. Do you offer a couples package?"
              className="bg-background"
            />
            <Button onClick={ask} disabled={loading} className="gap-1.5">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Ask
            </Button>
          </div>
          {answer && (
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <div className="text-sm leading-relaxed text-foreground/90">{answer}</div>
              <div className="mt-3 border-t border-border pt-3">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Citations</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Services & pricing PDF", "FAQ — common questions", "Lumen Dental Care website"].map((c) => (
                    <Badge key={c} variant="outline" className="gap-1 text-[10px]">
                      <FileText className="h-2.5 w-2.5" /> {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sources */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {knowledgeSources.map((s) => {
          const Icon = typeIcons[s.type] ?? FileText;
          const statusColor =
            s.status === "synced" ? "oklch(0.45 0.08 155)" :
            s.status === "syncing" ? "oklch(0.70 0.12 75)" :
            s.status === "error" ? "oklch(0.62 0.16 42)" :
            s.status === "draft" ? "oklch(0.5 0 0)" : "oklch(0.5 0 0)";
          return (
            <Card key={s.id} className="border-border bg-card transition-all hover:shadow-lift">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant="outline" className="gap-1 text-[9px]" style={{ color: statusColor, borderColor: `${statusColor}40` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
                    {s.status}
                  </Badge>
                </div>
                <div className="mt-3 text-sm font-medium">{s.name}</div>
                <div className="text-[11px] capitalize text-muted-foreground">{s.type} · {s.records} records</div>
                <div className="mt-1 text-[11px] text-muted-foreground">Synced {timeAgo(s.lastSync)}</div>
                {s.errors && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[oklch(0.62_0.16_42)]">
                    <AlertTriangle className="h-3 w-3" /> {s.errors} errors
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-1">
                  {s.channels.map((c) => {
                    const ch = channelList.find((cl) => cl.id === c)!;
                    return (
                      <span key={c} className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: `${ch.color}14`, color: ch.color }}>
                        <ChannelIcon id={c} className="h-2.5 w-2.5" /> {ch.short}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-1 border-t border-border pt-3">
                  <Button variant="ghost" size="sm" className="h-7 flex-1 text-[11px]"><RefreshCw className="h-3 w-3" /> Resync</Button>
                  <Button variant="ghost" size="sm" className="h-7 flex-1 text-[11px]"><Edit3 className="h-3 w-3" /> Edit</Button>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] text-[oklch(0.62_0.16_42)]"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coverage report */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Coverage report</div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                { topic: "Pricing & packages", cov: 92 },
                { topic: "Booking & scheduling", cov: 88 },
                { topic: "Cancellation policy", cov: 100 },
                { topic: "Team & bios", cov: 64 },
                { topic: "Location & hours", cov: 96 },
              ].map((t) => (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between"><span>{t.topic}</span><span className="text-muted-foreground">{t.cov}%</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${t.cov}%`, backgroundColor: t.cov >= 80 ? "oklch(0.45 0.08 155)" : "oklch(0.70 0.12 75)" }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Frequently unanswered</div>
            <div className="mt-3 space-y-2 text-xs">
              {[
                "Do you offer gift cards?",
                "What's your refund window?",
                "Can I bring my child to the session?",
                "Do you have parking?",
              ].map((q) => (
                <div key={q} className="rounded-lg border border-border bg-muted/20 p-2.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[oklch(0.70_0.12_75)]" />
                    <span>{q}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conflicting answers detected</div>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-lg border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/5 p-2.5">
                <div className="font-medium">Trial session length</div>
                <div className="mt-1 text-[11px] text-muted-foreground">PDF says 30 min · Website says 45 min</div>
                <Button variant="outline" size="sm" className="mt-2 h-6 text-[10px]">Resolve</Button>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-2.5 text-[11px] text-muted-foreground">
                No other conflicts detected.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionScroll>
  );
}
