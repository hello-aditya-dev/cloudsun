"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { m } from "motion/react";
import {
  product,
  pricingTiers,
  implementationNote,
  pricingDisclaimer,
} from "@/config/cloudsun";
import { calculateROI, type ROIInputs, type ROIOutputs } from "@/lib/demo-ai";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal, RevealGroup, RevealItem } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Check,
  ArrowRight,
  Calculator,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Phone,
  CalendarX,
  RotateCw,
  Clock,
} from "lucide-react";
import { motionDuration, motionEase } from "@/lib/motion/tokens";

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={sectionLabel}>{children}</div>;
}

function SectionHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`mt-4 font-serif text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] text-balance ${className}`}
    >
      {children}
    </h2>
  );
}

const defaultInputs: ROIInputs = {
  monthlyCalls: 420,
  missedCallPct: 22,
  qualifiedBookPct: 35,
  avgPatientValue: 650,
  monthlyCancellations: 38,
  avgApptValue: 220,
  recallDuePerMonth: 120,
  frontDeskHours: 90,
};

const usd = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

interface NumberFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: NumberFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            onChange(Number.isFinite(v) ? v : 0);
          }}
          className={suffix ? "pr-12" : ""}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OutputRow({
  icon: Icon,
  label,
  value,
  sub,
  accent = "ember",
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  accent?: "ember" | "forest";
}) {
  const color = accent === "forest" ? "oklch(0.45 0.08 155)" : "oklch(0.62 0.16 42)";
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/80">{sub}</div>}
      </div>
      <div className="font-serif text-xl text-foreground">{value}</div>
    </div>
  );
}

export function PricingPage() {
  const [inputs, setInputs] = useState<ROIInputs>(defaultInputs);
  const outputs: ROIOutputs = useMemo(() => calculateROI(inputs), [inputs]);

  const update = <K extends keyof ROIInputs>(key: K, value: ROIInputs[K]) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero / page intro */}
        <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-[oklch(0.45_0.08_155)] opacity-[0.05] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Pricing</SectionLabel>
              <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] text-balance">
                Plans that scale with your front desk,{" "}
                <span className="text-[oklch(0.62_0.16_42)]">not your anxiety.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                Dental-specific front-desk coverage across phone, email, WhatsApp and web chat.
                Implementation and onboarding are scoped separately so you only pay for what your
                practice actually needs.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="#roi">
                  <m.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Calculator className="mr-2 h-4 w-4" />
                      Estimate your opportunity
                    </Button>
                  </m.div>
                </Link>
                <Link href="/contact">
                  <m.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline">Book a dental workflow review</Button>
                  </m.div>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Pricing tiers */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Plans</SectionLabel>
              <SectionHeading>
                Three ways to put CloudSun Dental in front of your conversations.
              </SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                Every plan ships in demo mode first. You bring live telephony, calendar and channels
                when you&apos;re ready — never before.
              </p>
            </Reveal>

            <RevealGroup className="mt-12 grid gap-5 lg:grid-cols-3" stagger={0.1}>
              {pricingTiers.map((tier) => (
                <RevealItem key={tier.name}>
                  <m.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: motionDuration.fast, ease: motionEase.out }}
                  >
                    <Card
                      className={`relative overflow-hidden border bg-card ${
                        tier.highlighted
                          ? "border-[oklch(0.62_0.16_42)] shadow-lift"
                          : "border-border"
                      }`}
                    >
                      {tier.highlighted && (
                        <div className="bg-[oklch(0.62_0.16_42)] px-5 py-2 text-center text-xs font-medium text-white">
                          Most popular
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="font-serif text-xl">{tier.name}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{tier.summary}</p>
                        <div className="mt-5 flex items-baseline gap-1">
                          <span className="font-serif text-4xl">{tier.price}</span>
                          <span className="text-sm text-muted-foreground">{tier.cadence}</span>
                        </div>
                        <Link href="/contact" className="mt-6 block">
                          <Button
                            className={`w-full ${
                              tier.highlighted
                                ? "bg-[oklch(0.62_0.16_42)] text-white hover:bg-[oklch(0.62_0.16_42)]/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {tier.cta}
                          </Button>
                        </Link>
                        <ul className="mt-6 space-y-2.5">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.45_0.08_155)]" />
                              <span className="text-foreground/80">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </m.div>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Implementation note + disclaimer */}
            <Reveal className="mt-10">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border bg-muted/30">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Implementation &amp; onboarding</div>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {implementationNote}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.04]">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.62_0.16_42)]/15 text-[oklch(0.62_0.16_42)]">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[oklch(0.62_0.16_42)]">
                          Important — pre-release
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                          {pricingDisclaimer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ROI calculator */}
        <section
          id="roi"
          className="scroll-mt-24 border-t border-border/60 bg-muted/30 py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>ROI calculator</SectionLabel>
              <SectionHeading>
                What would an always-on dental front desk be worth to your practice?
              </SectionHeading>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
                Adjust the sliders below to estimate the revenue currently at risk from missed
                calls, cancellations and overdue recall — and the front-desk hours CloudSun Dental
                could help address.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {/* Inputs */}
              <Reveal variant="left">
                <Card className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Calculator className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                      Your practice inputs
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      All values are illustrative. Nothing is stored or sent.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <NumberField
                        id="monthlyCalls"
                        label="Monthly calls"
                        hint="Total inbound calls to your front desk"
                        value={inputs.monthlyCalls}
                        onChange={(v) => update("monthlyCalls", v)}
                        min={0}
                      />
                      <NumberField
                        id="missedCallPct"
                        label="Missed-call %"
                        hint="Calls that go unanswered or after-hours"
                        value={inputs.missedCallPct}
                        onChange={(v) => update("missedCallPct", v)}
                        min={0}
                        max={100}
                        suffix="%"
                      />
                      <NumberField
                        id="qualifiedBookPct"
                        label="Qualified-book %"
                        hint="Of missed calls, share likely to convert"
                        value={inputs.qualifiedBookPct}
                        onChange={(v) => update("qualifiedBookPct", v)}
                        min={0}
                        max={100}
                        suffix="%"
                      />
                      <NumberField
                        id="avgPatientValue"
                        label="Avg patient value"
                        hint="Lifetime value of a new patient"
                        value={inputs.avgPatientValue}
                        onChange={(v) => update("avgPatientValue", v)}
                        min={0}
                        step={10}
                        suffix="USD"
                      />
                      <NumberField
                        id="monthlyCancellations"
                        label="Monthly cancellations"
                        hint="Slots that go unfilled per month"
                        value={inputs.monthlyCancellations}
                        onChange={(v) => update("monthlyCancellations", v)}
                        min={0}
                      />
                      <NumberField
                        id="avgApptValue"
                        label="Avg appointment value"
                        hint="Revenue per filled appointment"
                        value={inputs.avgApptValue}
                        onChange={(v) => update("avgApptValue", v)}
                        min={0}
                        step={5}
                        suffix="USD"
                      />
                      <NumberField
                        id="recallDuePerMonth"
                        label="Recall due / month"
                        hint="Patients due or overdue for hygiene"
                        value={inputs.recallDuePerMonth}
                        onChange={(v) => update("recallDuePerMonth", v)}
                        min={0}
                      />
                      <NumberField
                        id="frontDeskHours"
                        label="Front-desk hours"
                        hint="Hours/month on repetitive communication"
                        value={inputs.frontDeskHours}
                        onChange={(v) => update("frontDeskHours", v)}
                        min={0}
                        suffix="hrs"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              {/* Outputs */}
              <Reveal variant="scale">
                <Card className="border-border bg-card shadow-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Sparkles className="h-4 w-4 text-[oklch(0.62_0.16_42)]" />
                        Estimated monthly opportunity
                      </div>
                      <Badge
                        variant="outline"
                        className="border-[oklch(0.62_0.16_42)]/30 text-[10px] text-[oklch(0.62_0.16_42)]"
                      >
                        Simulated
                      </Badge>
                    </div>

                    <div className="mt-5 rounded-2xl border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.05] p-5 text-center">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]">
                        Total monthly opportunity
                      </div>
                      <div className="mt-1 font-serif text-4xl text-foreground sm:text-5xl">
                        {usd(outputs.totalOpportunity)}
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        Suggested plan:{" "}
                        <span className="font-medium text-foreground">
                          {outputs.suggestedPlan}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <OutputRow
                        icon={Phone}
                        label="New-patient revenue at risk"
                        sub="From missed and after-hours calls"
                        value={usd(outputs.newPatientRevenueAtRisk)}
                      />
                      <OutputRow
                        icon={CalendarX}
                        label="Cancellation revenue at risk"
                        sub="Unfilled slots per month"
                        value={usd(outputs.cancellationRevenueAtRisk)}
                        accent="forest"
                      />
                      <OutputRow
                        icon={RotateCw}
                        label="Recall opportunity"
                        sub="Estimated 30% reactivation"
                        value={usd(outputs.recallOpportunity)}
                        accent="forest"
                      />
                      <OutputRow
                        icon={Clock}
                        label="Admin hours addressable"
                        sub="Estimated 40% of repetitive comms"
                        value={`${outputs.adminHoursAddressable} hrs`}
                      />
                    </div>

                    <div className="mt-6 flex flex-col gap-2">
                      <Link href="/contact">
                        <m.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            Discuss this with our team
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </m.div>
                      </Link>
                      <Link href="/demo">
                        <Button variant="outline" className="w-full">
                          Try the dental front desk
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>

            <Reveal className="mt-8">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Estimates are illustrative and depend on practice volume, conversion, service mix
                  and implementation quality.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/60 bg-background py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            <Card className="relative overflow-hidden border-border bg-[oklch(0.24_0.012_50)] text-white shadow-lift">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[oklch(0.62_0.16_42)] opacity-20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[oklch(0.45_0.08_155)] opacity-20 blur-3xl" />
              <CardContent className="relative p-10 text-center lg:p-16">
                <Sparkles className="mx-auto h-8 w-8 text-[oklch(0.70_0.12_75)]" />
                <h2 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-5xl text-balance">
                  See CloudSun Dental on your own conversations.
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-base text-white/70 text-pretty">
                  {product.tagline} Start in demo mode, then bring live telephony and calendar when
                  you&apos;re ready.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/demo">
                    <Button
                      size="lg"
                      className="bg-[oklch(0.62_0.16_42)] text-white hover:bg-[oklch(0.62_0.16_42)]/90"
                    >
                      Try the dental front desk
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/app">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                    >
                      Explore the dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
