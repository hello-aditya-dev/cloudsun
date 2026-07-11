"use client";

import {
  LayoutDashboard, Inbox, Phone, Users, CalendarDays, Sparkles, BookOpen,
  Workflow, BarChart3, UserCog, Plug, Settings, CreditCard, ShieldCheck,
  Mail, MessageCircle, MessageSquare, Calendar, FileText, Video, Briefcase,
  Webhook, Zap, Code, HardDrive, type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  LayoutDashboard, Inbox, Phone, Users, CalendarDays, Sparkles, BookOpen,
  Workflow, BarChart3, UserCog, Plug, Settings, CreditCard, ShieldCheck,
  Mail, MessageCircle, MessageSquare, Calendar, FileText, Video, Briefcase,
  Webhook, Zap, Code, HardDrive,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = map[name] ?? LayoutDashboard;
  return <C className={className} />;
}
