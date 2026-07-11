"use client";

import { channels, type ChannelId } from "@/config/cloudsun";
import { Phone, Mail, MessageCircle, MessageSquare, type LucideIcon } from "lucide-react";

const iconMap: Record<ChannelId, LucideIcon> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  webchat: MessageSquare,
};

export function ChannelIcon({ id, className }: { id: ChannelId; className?: string }) {
  const C = iconMap[id];
  return <C className={className} />;
}

export function ChannelBadge({
  id,
  withLabel = false,
  className = "",
}: {
  id: ChannelId;
  withLabel?: boolean;
  className?: string;
}) {
  const c = channels[id];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
      style={{ backgroundColor: `${c.color}14`, color: c.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
      {withLabel && c.short}
    </span>
  );
}

export function ChannelDot({ id, className = "" }: { id: ChannelId; className?: string }) {
  const c = channels[id];
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${className}`}
      style={{ backgroundColor: c.color }}
    />
  );
}
