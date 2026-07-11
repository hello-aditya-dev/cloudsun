"use client";

import { useState } from "react";
import { appNav, product } from "@/config/cloudsun";
import { workspace as demoWorkspace, team } from "@/data/demo";
import { Icon } from "../shared/Icon";
import { Wordmark, Logo } from "../shared/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronsLeft, Search, Bell, HelpCircle, PanelLeftClose, PanelLeft,
  Plus, Command, Sparkles, Menu, X, ArrowLeft,
} from "lucide-react";

export type AppSection = string;

export function AppShell({
  section,
  onSection,
  onExit,
  children,
  title,
}: {
  section: AppSection;
  onSection: (s: string) => void;
  onExit: () => void;
  children: React.ReactNode;
  title: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const me = team[0];

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/60 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:flex"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-2 sm:flex">
            <h1 className="font-serif text-lg leading-none">{title}</h1>
            <Badge variant="outline" className="gap-1 text-[10px] font-normal text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.70_0.12_75)]" />
              {product.demoModeLabel}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="hidden items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted md:flex md:w-64">
            <Search className="h-3.5 w-3.5" />
            <span>Search…</span>
            <span className="ml-auto flex items-center gap-0.5 text-[10px]">
              <Command className="h-3 w-3" />K
            </span>
          </button>

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.45_0.08_155)] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.45_0.08_155)]" />
            </span>
            <span className="hidden sm:inline">AI online</span>
          </div>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[oklch(0.62_0.16_42)]" />
          </button>
          <button className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted sm:flex" aria-label="Help">
            <HelpCircle className="h-4 w-4" />
          </button>

          <div className="ml-1 flex items-center gap-2 rounded-full border border-border bg-background py-0.5 pl-0.5 pr-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback style={{ backgroundColor: me.avatarColor, color: "white" }} className="text-[10px]">
                {me.initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <div className="text-[11px] font-medium leading-none">{me.name}</div>
              <div className="text-[10px] capitalize text-muted-foreground">{me.role.replace("_", " ")}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className={`hidden shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 lg:flex ${
            collapsed ? "w-16" : "w-60"
          }`}
        >
          <SidebarContent
            section={section}
            onSection={onSection}
            collapsed={collapsed}
            onExit={onExit}
          />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav section={section} onSection={onSection} />

      {/* Mobile slide-over */}
      {mobileNavOpen && (
        <MobileSlideOver
          section={section}
          onSection={(s) => {
            onSection(s);
            setMobileNavOpen(false);
          }}
          onClose={() => setMobileNavOpen(false)}
          onExit={onExit}
        />
      )}
    </div>
  );
}

function SidebarContent({
  section,
  onSection,
  collapsed,
  onExit,
}: {
  section: string;
  onSection: (s: string) => void;
  collapsed: boolean;
  onExit: () => void;
}) {
  const primary = appNav.filter((n) => n.group === "primary");
  const secondary = appNav.filter((n) => n.group === "secondary");

  return (
    <div className="flex h-full flex-col">
      {/* Workspace switcher */}
      <div className={`border-b border-sidebar-border p-3 ${collapsed ? "px-2" : ""}`}>
        <button className={`flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-card p-2 text-left hover:bg-muted ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[oklch(0.24_0.012_50)] text-white">
            <Logo size={16} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium">{demoWorkspace.name}</div>
              <div className="text-[10px] text-muted-foreground">{demoWorkspace.plan} plan</div>
            </div>
          )}
          {!collapsed && <ChevronsLeft className="h-3.5 w-3.5 rotate-90 text-muted-foreground" />}
        </button>
      </div>

      {/* New conversation */}
      <div className={`p-3 ${collapsed ? "px-2" : ""}`}>
        <button className={`flex w-full items-center gap-2 rounded-lg bg-[oklch(0.62_0.16_42)] px-3 py-2 text-xs font-medium text-white hover:bg-[oklch(0.62_0.16_42)]/90 ${collapsed ? "justify-center" : ""}`}>
          <Plus className="h-3.5 w-3.5" />
          {!collapsed && "New conversation"}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 scroll-thin">
        {primary.map((item) => (
          <NavButton key={item.id} item={item} active={section === item.id} collapsed={collapsed} onClick={() => onSection(item.id)} />
        ))}
        <div className="my-3 border-t border-sidebar-border" />
        <div className={`px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ${collapsed ? "hidden" : ""}`}>
          Manage
        </div>
        {secondary.map((item) => (
          <NavButton key={item.id} item={item} active={section === item.id} collapsed={collapsed} onClick={() => onSection(item.id)} />
        ))}
      </nav>

      {/* Channel health */}
      {!collapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Channel health</div>
          <div className="space-y-1.5">
            {[
              { label: "Phone", status: "demo", color: "oklch(0.70 0.12 75)" },
              { label: "WhatsApp", status: "delayed", color: "oklch(0.70 0.12 75)" },
              { label: "Email", status: "reauth", color: "oklch(0.62 0.16 42)" },
              { label: "Website chat", status: "live", color: "oklch(0.45 0.08 155)" },
            ].map((c) => (
              <div key={c.label} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.label}
                </div>
                <span className="capitalize text-muted-foreground">{c.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exit */}
      <div className={`border-t border-sidebar-border p-3 ${collapsed ? "px-2" : ""}`}>
        <button
          onClick={onExit}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted ${collapsed ? "justify-center" : ""}`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {!collapsed && "Back to site"}
        </button>
      </div>
    </div>
  );
}

function NavButton({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: { id: string; label: string; icon: string; badge?: string };
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
      } ${collapsed ? "justify-center" : ""}`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[oklch(0.62_0.16_42)]" />}
      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
      {!collapsed && item.badge && (
        <span className="rounded-full bg-[oklch(0.62_0.16_42)] px-1.5 py-0.5 text-[10px] font-medium text-white">
          {item.badge}
        </span>
      )}
    </button>
  );
}

function MobileBottomNav({ section, onSection }: { section: string; onSection: (s: string) => void }) {
  const items = appNav.filter((n) =>
    ["overview", "inbox", "calls", "contacts", "calendar"].includes(n.id)
  );
  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-border bg-card px-2 py-1.5 lg:hidden">
      {items.map((item) => {
        const active = section === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSection(item.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] ${active ? "text-[oklch(0.62_0.16_42)]" : "text-muted-foreground"}`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function MobileSlideOver({
  section,
  onSection,
  onClose,
  onExit,
}: {
  section: string;
  onSection: (s: string) => void;
  onClose: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] animate-fade-up border-r border-border bg-sidebar shadow-lift">
        <div className="flex items-center justify-between border-b border-sidebar-border p-3">
          <Wordmark className="!text-base" />
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2">
          {appNav.map((item) => (
            <NavButton key={item.id} item={item} active={section === item.id} collapsed={false} onClick={() => onSection(item.id)} />
          ))}
        </div>
        <div className="border-t border-sidebar-border p-3">
          <button onClick={onExit} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </button>
        </div>
      </div>
    </div>
  );
}
