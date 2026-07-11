import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

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
  title: "CloudSun — Every client conversation, one intelligent front desk",
  description:
    "CloudSun is an omnichannel AI front desk. It answers calls, manages email, responds on WhatsApp, handles website chat and books appointments — while keeping your team in control.",
  keywords: [
    "CloudSun",
    "AI front desk",
    "omnichannel inbox",
    "AI receptionist",
    "shared inbox",
    "appointment scheduling",
    "WhatsApp business",
    "call management",
  ],
  authors: [{ name: "CloudSun" }],
  openGraph: {
    title: "CloudSun — Every client conversation, one intelligent front desk",
    description:
      "Answer phone calls, manage email, respond on WhatsApp, handle website chat and book appointments from one AI-powered workspace.",
    siteName: "CloudSun",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CloudSun",
    description: "Omnichannel AI front desk and shared client inbox.",
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
        {children}
        <Toaster />
        <SonnerToaster position="bottom-right" />
      </body>
    </html>
  );
}
