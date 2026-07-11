import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { MotionProvider } from "@/components/cloudsun/motion/MotionProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "CloudSun Dental — AI Front Desk for Dental Practices",
  description:
    "Manage new-patient enquiries, appointment requests, cancellations, recalls and treatment follow-up from one intelligent dental front desk.",
  keywords: [
    "CloudSun Dental",
    "dental AI front desk",
    "dental practice management",
    "new-patient intake",
    "appointment scheduling",
    "cancellation recovery",
    "patient recall",
    "treatment follow-up",
    "dental practice software",
  ],
  authors: [{ name: "CloudSun Dental" }],
  openGraph: {
    title: "CloudSun Dental — AI Front Desk for Dental Practices",
    description:
      "Fill your schedule without adding more pressure to your front desk. Handles new-patient enquiries, appointments, cancellations, recalls and treatment follow-up.",
    siteName: "CloudSun Dental",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudSun Dental",
    description: "The AI-powered front desk for modern dental practices.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground`}
      >
        <MotionProvider>
          {children}
        </MotionProvider>
        <Toaster />
        <SonnerToaster position="bottom-right" />
      </body>
    </html>
  );
}
