"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { z } from "zod";
import { product } from "@/config/cloudsun";
import { MarketingHeader } from "./MarketingHeader";
import { Footer } from "./Sections";
import { Reveal } from "../motion/Reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  Phone,
  MessageCircle,
  Building2,
  Stethoscope,
  PhoneIncoming,
  AlertTriangle,
  Plug,
  Target,
  Globe,
  User,
  Send,
  ShieldCheck,
} from "lucide-react";

const sectionLabel =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-[oklch(0.62_0.16_42)]";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className={sectionLabel}>{children}</div>;
}

// ─── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  practiceName: z.string().min(2, "Please enter your practice name."),
  locations: z.coerce.number().int("Must be a whole number.").min(1, "At least one location."),
  dentists: z.coerce.number().int("Must be a whole number.").min(1, "At least one dentist."),
  monthlyCalls: z.coerce
    .number()
    .int("Must be a whole number.")
    .min(0, "Cannot be negative."),
  missedCallChallenge: z.enum(["minimal", "occasional", "frequent", "severe"], {
    message: "Pick the option that best describes your front desk today.",
  }),
  pms: z.string().min(1, "Tell us which PMS you run on."),
  objective: z.string().min(1, "Tell us your primary objective."),
  country: z.string().min(1, "Country is required."),
  contactName: z.string().min(2, "Please enter your name."),
  email: z.string().min(1, "Work email is required.").email("Please enter a valid work email."),
  phone: z.string().optional(),
  preferredContact: z.enum(["email", "phone", "whatsapp"], {
    message: "Pick how you'd like us to reach you.",
  }),
});

type FormValues = {
  practiceName: string;
  locations: string;
  dentists: string;
  monthlyCalls: string;
  missedCallChallenge: "minimal" | "occasional" | "frequent" | "severe";
  pms: string;
  objective: string;
  country: string;
  contactName: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone" | "whatsapp";
};

const initialValues: FormValues = {
  practiceName: "",
  locations: "1",
  dentists: "1",
  monthlyCalls: "300",
  missedCallChallenge: "occasional",
  pms: "",
  objective: "",
  country: "",
  contactName: "",
  email: "",
  phone: "",
  preferredContact: "email",
};

const pmsOptions = [
  "Dentrix",
  "Open Dental",
  "Eaglesoft",
  "Curve Dental",
  "CareStack",
  "Denticon",
  "Other / not sure",
];

const objectiveOptions = [
  "New-patient intake",
  "After-hours coverage",
  "Cancellation recovery",
  "Recall and reactivation",
  "Treatment follow-up",
  "Multi-location standardization",
  "Just exploring",
];

const countryOptions = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "Australia",
  "New Zealand",
  "India",
  "United Arab Emirates",
  "Saudi Arabia",
  "Singapore",
  "Other",
];

const missedCallOptions: { value: string; label: string }[] = [
  { value: "minimal", label: "Minimal — we answer almost everything" },
  { value: "occasional", label: "Occasional — we miss a few a day" },
  { value: "frequent", label: "Frequent — we miss a meaningful share" },
  { value: "severe", label: "Severe — after-hours and overflow are a real problem" },
];

const contactMethodOptions: { value: "email" | "phone" | "whatsapp"; label: string; icon: typeof Mail }[] = [
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

// ─── Field helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[oklch(0.62_0.16_42)]">
      <AlertTriangle className="h-3 w-3" />
      {message}
    </p>
  );
}

function FieldShell({
  id,
  label,
  icon: Icon,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-2 text-foreground">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const reduced = useReducedMotion();

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Dental workflow review — ${values.practiceName || "your practice"}`);
    const body = encodeURIComponent(
      [
        `Practice name: ${values.practiceName}`,
        `Locations: ${values.locations}`,
        `Dentists: ${values.dentists}`,
        `Approx monthly calls: ${values.monthlyCalls}`,
        `Missed-call challenge: ${values.missedCallChallenge}`,
        `Current PMS: ${values.pms}`,
        `Primary objective: ${values.objective}`,
        `Country: ${values.country}`,
        `Contact name: ${values.contactName}`,
        `Work email: ${values.email}`,
        `Phone: ${values.phone || "—"}`,
        `Preferred contact: ${values.preferredContact}`,
      ].join("\n"),
    );
    return `mailto:${product.email}?subject=${subject}&body=${body}`;
  }, [values]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const next: Partial<Record<keyof FormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues | undefined;
        if (key && !next[key]) {
          next[key] = issue.message;
        }
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitted(true);
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper py-16 lg:py-24">
          <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[oklch(0.62_0.16_42)] opacity-[0.06] blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-[oklch(0.45_0.08_155)] opacity-[0.05] blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>Contact</SectionLabel>
              <h1 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem] text-balance">
                Book a dental workflow review.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                Tell us a little about your practice and your front-desk challenges. We&apos;ll walk
                you through what CloudSun Dental could handle for you — honestly, including what
                would still need a human.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[oklch(0.62_0.16_42)]/30 bg-[oklch(0.62_0.16_42)]/[0.05] px-3 py-1.5 text-xs text-[oklch(0.62_0.16_42)]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Demo mode · no email is sent when you submit
              </div>
            </Reveal>
          </div>
        </section>

        {/* Form / success */}
        <section className="border-t border-border/60 bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-5 lg:px-8">
            {submitted ? (
              <Reveal variant="scale">
                <Card className="border-[oklch(0.45_0.08_155)]/30 bg-card shadow-lift">
                  <CardContent className="flex flex-col items-center gap-5 p-10 text-center lg:p-14">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.45_0.08_155)]/10 text-[oklch(0.45_0.08_155)]">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h2 className="font-serif text-3xl leading-tight text-foreground sm:text-4xl text-balance">
                      Thank you. Your enquiry has been captured in demo mode.
                    </h2>
                    <p className="max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
                      No email has been sent. In a real deployment this submission would route to our
                      sales team and create a tracked enquiry in CloudSun Dental. For now, please use
                      the mailto link below if you&apos;d like to follow up directly.
                    </p>

                    <Card className="w-full max-w-xl border-border bg-muted/30 text-left">
                      <CardContent className="space-y-1.5 p-5 text-sm">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Captured details
                        </div>
                        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                          <div className="text-muted-foreground">
                            Practice:{" "}
                            <span className="text-foreground">{values.practiceName || "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Locations:{" "}
                            <span className="text-foreground">{values.locations}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Dentists:{" "}
                            <span className="text-foreground">{values.dentists}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Monthly calls:{" "}
                            <span className="text-foreground">{values.monthlyCalls}</span>
                          </div>
                          <div className="text-muted-foreground">
                            PMS:{" "}
                            <span className="text-foreground">{values.pms || "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Objective:{" "}
                            <span className="text-foreground">{values.objective || "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Contact:{" "}
                            <span className="text-foreground">{values.contactName || "—"}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Email: <span className="text-foreground">{values.email}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <a href={mailtoHref}>
                        <m.div
                          whileHover={reduced ? undefined : { y: -1 }}
                          whileTap={reduced ? undefined : { scale: 0.98 }}
                        >
                          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Mail className="mr-2 h-4 w-4" />
                            Send via email instead
                          </Button>
                        </m.div>
                      </a>
                      <Button variant="outline" onClick={resetForm}>
                        Submit another enquiry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ) : (
              <Reveal variant="scale">
                <Card className="border-border bg-card shadow-soft">
                  <CardContent className="p-6 lg:p-10">
                    <form onSubmit={handleSubmit} noValidate className="space-y-10">
                      {/* Section 1 — About your practice */}
                      <div>
                        <SectionLabel>About your practice</SectionLabel>
                        <h3 className="mt-2 font-serif text-2xl text-foreground">
                          Tell us about the practice itself.
                        </h3>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <FieldShell
                            id="practiceName"
                            label="Practice name"
                            icon={Building2}
                            error={errors.practiceName}
                          >
                            <Input
                              id="practiceName"
                              value={values.practiceName}
                              onChange={(e) => update("practiceName", e.target.value)}
                              placeholder="Lumen Dental Care"
                              aria-invalid={!!errors.practiceName}
                            />
                          </FieldShell>

                          <FieldShell
                            id="country"
                            label="Country"
                            icon={Globe}
                            error={errors.country}
                          >
                            <select
                              id="country"
                              value={values.country}
                              onChange={(e) => update("country", e.target.value)}
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                              aria-invalid={!!errors.country}
                            >
                              <option value="">Select a country</option>
                              {countryOptions.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </FieldShell>

                          <FieldShell
                            id="locations"
                            label="Number of locations"
                            icon={Building2}
                            hint="Single-location practices are welcome too."
                            error={errors.locations}
                          >
                            <Input
                              id="locations"
                              type="number"
                              min={1}
                              value={values.locations}
                              onChange={(e) => update("locations", e.target.value)}
                              aria-invalid={!!errors.locations}
                            />
                          </FieldShell>

                          <FieldShell
                            id="dentists"
                            label="Number of dentists"
                            icon={Stethoscope}
                            error={errors.dentists}
                          >
                            <Input
                              id="dentists"
                              type="number"
                              min={1}
                              value={values.dentists}
                              onChange={(e) => update("dentists", e.target.value)}
                              aria-invalid={!!errors.dentists}
                            />
                          </FieldShell>
                        </div>
                      </div>

                      {/* Section 2 — Your front desk today */}
                      <div>
                        <SectionLabel>Your front desk today</SectionLabel>
                        <h3 className="mt-2 font-serif text-2xl text-foreground">
                          How do calls and enquiries reach your team today?
                        </h3>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <FieldShell
                            id="monthlyCalls"
                            label="Approximate monthly calls"
                            icon={PhoneIncoming}
                            hint="Best guess is fine — used to scope the pilot."
                            error={errors.monthlyCalls}
                          >
                            <Input
                              id="monthlyCalls"
                              type="number"
                              min={0}
                              value={values.monthlyCalls}
                              onChange={(e) => update("monthlyCalls", e.target.value)}
                              aria-invalid={!!errors.monthlyCalls}
                            />
                          </FieldShell>

                          <FieldShell
                            id="pms"
                            label="Current PMS"
                            icon={Plug}
                            hint="The practice-management system your team uses."
                            error={errors.pms}
                          >
                            <select
                              id="pms"
                              value={values.pms}
                              onChange={(e) => update("pms", e.target.value)}
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                              aria-invalid={!!errors.pms}
                            >
                              <option value="">Select your PMS</option>
                              {pmsOptions.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </FieldShell>

                          <div className="sm:col-span-2">
                            <FieldShell
                              id="missedCallChallenge"
                              label="Current missed-call challenge"
                              icon={AlertTriangle}
                              error={errors.missedCallChallenge}
                            >
                              <div className="grid gap-2 sm:grid-cols-2">
                                {missedCallOptions.map((opt) => {
                                  const active = values.missedCallChallenge === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() =>
                                        update(
                                          "missedCallChallenge",
                                          opt.value as FormValues["missedCallChallenge"],
                                        )
                                      }
                                      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                                        active
                                          ? "border-[oklch(0.62_0.16_42)] bg-[oklch(0.62_0.16_42)]/[0.05] text-foreground ring-ember"
                                          : "border-border bg-card text-foreground/80 hover:border-[oklch(0.62_0.16_42)]/40"
                                      }`}
                                      aria-pressed={active}
                                    >
                                      <span
                                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                          active
                                            ? "border-[oklch(0.62_0.16_42)] bg-[oklch(0.62_0.16_42)] text-white"
                                            : "border-border"
                                        }`}
                                      >
                                        {active && <CheckCircle2 className="h-3 w-3" />}
                                      </span>
                                      <span>{opt.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </FieldShell>
                          </div>
                        </div>
                      </div>

                      {/* Section 3 — What you're looking for */}
                      <div>
                        <SectionLabel>What you&apos;re looking for</SectionLabel>
                        <h3 className="mt-2 font-serif text-2xl text-foreground">
                          If CloudSun Dental could fix one thing this quarter, what would it be?
                        </h3>
                        <div className="mt-6">
                          <FieldShell
                            id="objective"
                            label="Primary objective"
                            icon={Target}
                            error={errors.objective}
                          >
                            <select
                              id="objective"
                              value={values.objective}
                              onChange={(e) => update("objective", e.target.value)}
                              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                              aria-invalid={!!errors.objective}
                            >
                              <option value="">Select your primary objective</option>
                              {objectiveOptions.map((o) => (
                                <option key={o} value={o}>
                                  {o}
                                </option>
                              ))}
                            </select>
                          </FieldShell>
                        </div>
                      </div>

                      {/* Section 4 — How to reach you */}
                      <div>
                        <SectionLabel>How to reach you</SectionLabel>
                        <h3 className="mt-2 font-serif text-2xl text-foreground">
                          Where should we send the next step?
                        </h3>
                        <div className="mt-6 grid gap-5 sm:grid-cols-2">
                          <FieldShell
                            id="contactName"
                            label="Contact name"
                            icon={User}
                            error={errors.contactName}
                          >
                            <Input
                              id="contactName"
                              value={values.contactName}
                              onChange={(e) => update("contactName", e.target.value)}
                              placeholder="Dr. Priya Sharma"
                              aria-invalid={!!errors.contactName}
                            />
                          </FieldShell>

                          <FieldShell
                            id="email"
                            label="Work email"
                            icon={Mail}
                            error={errors.email}
                          >
                            <Input
                              id="email"
                              type="email"
                              value={values.email}
                              onChange={(e) => update("email", e.target.value)}
                              placeholder="priya@lumendental.com"
                              aria-invalid={!!errors.email}
                            />
                          </FieldShell>

                          <FieldShell
                            id="phone"
                            label="Phone (optional)"
                            icon={Phone}
                            hint="Include country code if outside the US."
                            error={errors.phone}
                          >
                            <Input
                              id="phone"
                              type="tel"
                              value={values.phone}
                              onChange={(e) => update("phone", e.target.value)}
                              placeholder="+1 555 0100"
                              aria-invalid={!!errors.phone}
                            />
                          </FieldShell>

                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-2 text-foreground">
                              <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                              Preferred contact method
                            </Label>
                            <div className="flex flex-wrap gap-2">
                              {contactMethodOptions.map((opt) => {
                                const Icon = opt.icon;
                                const active = values.preferredContact === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => update("preferredContact", opt.value)}
                                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                                      active
                                        ? "border-[oklch(0.62_0.16_42)] bg-[oklch(0.62_0.16_42)]/[0.05] text-foreground ring-ember"
                                        : "border-border bg-card text-foreground/80 hover:border-[oklch(0.62_0.16_42)]/40"
                                    }`}
                                    aria-pressed={active}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                            <FieldError message={errors.preferredContact} />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <div className="flex flex-col items-start gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Submissions are captured in demo mode only — no email is sent.
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <a href={mailtoHref} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                            Or use mailto
                          </a>
                          <m.div
                            whileHover={reduced ? undefined : { y: -1 }}
                            whileTap={reduced ? undefined : { scale: 0.98 }}
                          >
                            <Button
                              type="submit"
                              size="lg"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Submit enquiry
                            </Button>
                          </m.div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </Reveal>
            )}
          </div>
        </section>

        {/* What happens next */}
        <section className="border-t border-border/60 bg-muted/30 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal className="max-w-3xl">
              <SectionLabel>What happens next</SectionLabel>
              <h2 className="mt-3 font-serif text-2xl leading-tight text-foreground sm:text-3xl">
                A short, honest conversation — not a hard sell.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Quick discovery call",
                  body: "30 minutes to understand your front desk, your PMS, and where calls are slipping through today.",
                },
                {
                  step: "02",
                  title: "Scoped pilot",
                  body: "We propose a controlled pilot — usually after-hours and overflow first — with clear success criteria.",
                },
                {
                  step: "03",
                  title: "Production path",
                  body: "If the pilot works, we scope the technical, contractual and legal controls needed to go live.",
                },
              ].map((c) => (
                <Card key={c.step} className="border-border bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-2xl text-[oklch(0.62_0.16_42)]">{c.step}</span>
                      <div className="font-serif text-lg">{c.title}</div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/demo">
                <Button variant="outline">
                  Or try the dental front desk first
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
