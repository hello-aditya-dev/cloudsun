import type { Metadata } from "next";
import { AppShell } from "@/components/cloudsun/app/AppShell";

export const metadata: Metadata = {
  title: "CloudSun — Dashboard",
  description: "CloudSun demo workspace",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
