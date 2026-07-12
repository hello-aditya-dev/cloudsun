import { MarketingHeader } from "@/components/cloudsun/marketing/MarketingHeader";
import { Footer } from "@/components/cloudsun/marketing/Sections";

const content: Record<string, { title: string; body: React.ReactNode }> = {
  privacy: {
    title: "Privacy Policy",
    body: <p>CloudSun Dental is an interactive product prototype. This privacy policy is a template and does not constitute a legally binding document. Production deployments would require a privacy policy reviewed by qualified legal counsel appropriate to the customer's jurisdiction.</p>,
  },
  terms: {
    title: "Terms of Service",
    body: <p>CloudSun Dental is an interactive product prototype. These terms are a template. Production deployments would require terms of service reviewed by qualified legal counsel.</p>,
  },
  "ai-disclosure": {
    title: "AI Disclosure",
    body: <p>CloudSun Dental uses simulated AI responses in demonstration mode. No real AI model is called. In production, CloudSun Dental would disclose to patients that they are speaking with an AI assistant. The system does not diagnose conditions or replace clinical judgement.</p>,
  },
  "data-processing": {
    title: "Data Processing",
    body: <p>CloudSun Dental is an interactive product prototype. No real patient data is processed. All data in the demonstration is fictional. Production deployments would require data processing agreements and technical controls appropriate to the customer's jurisdiction and applicable healthcare regulations.</p>,
  },
  "responsible-ai": {
    title: "Responsible AI",
    body: <p>CloudSun Dental's AI does not diagnose conditions, promise treatment outcomes, or pressure patients. Clinical questions are always handed off to human team members. Emergency red flags trigger immediate escalation. The system uses only practice-approved information and respects patient consent and do-not-contact preferences.</p>,
  },
  status: {
    title: "System Status",
    body: <p>CloudSun Dental is currently in prototype development. All systems are in demonstration mode. No production services are deployed.</p>,
  },
};

export default function Page() {
  return (
    <>
      <MarketingHeader />
      <main className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <h1 className="font-serif text-3xl tracking-tight">{content["status"].title}</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {content["status"].body}
        </div>
        <div className="mt-8 rounded-lg border border-[oklch(0.62_0.16_42)]/20 bg-[oklch(0.62_0.16_42)]/[0.03] p-4 text-xs text-muted-foreground">
          This page is an honest template. CloudSun Dental does not claim HIPAA, SOC 2, GDPR, or any other compliance certification. Production healthcare deployments require technical, contractual, and legal controls appropriate to the customer's jurisdiction.
        </div>
      </main>
      <Footer />
    </>
  );
}
