"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  LibraryBig,
  List,
  Radar,
  Settings,
  SlidersHorizontal,
  Sparkles,
  TestTube2,
  Waypoints,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { DASHBOARD_DOCS_URL } from "@/lib/dashboard-config";

interface SidebarProps {
  workspaceLabel: string;
  userEmail: string;
  userAvatarUrl: string | null;
  projectSlug?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function getInitials(email: string) {
  const [first = "A", second = ""] = email.split("@")[0]?.split(/[.\-_]/) ?? [];
  return `${first[0] ?? "A"}${second[0] ?? ""}`.toUpperCase();
}

function buildWorkspaceNav(): NavGroup[] {
  return [
    {
      label: "Workspace",
      items: [
        { href: "/overview", label: "Overview", icon: LayoutDashboard },
        { href: "/costs", label: "Costs", icon: DollarSign },
      ],
    },
  ];
}

function buildProjectNav(projectSlug: string): NavGroup[] {
  const base = `/projects/${projectSlug}`;
  return [
    {
      label: "Ward",
      items: [
        { href: base, label: "Dashboard", icon: LayoutDashboard },
        { href: `${base}/traces`, label: "Traces", icon: List },
        { href: `${base}/sessions`, label: "Sessions", icon: Waypoints },
        { href: `${base}/monitors`, label: "Monitors", icon: Radar },
      ],
    },
    {
      label: "Evaluate",
      items: [
        { href: `${base}/datasets`, label: "Datasets", icon: FolderKanban },
        { href: `${base}/experiments`, label: "Experiments", icon: FlaskConical },
        { href: `${base}/evals`, label: "Evals", icon: TestTube2 },
        { href: `${base}/ab-tests`, label: "A/B Tests", icon: SlidersHorizontal },
      ],
    },
    {
      label: "Build",
      items: [
        { href: `${base}/playground`, label: "Playground", icon: Sparkles },
        { href: `${base}/prompts`, label: "Prompts", icon: LibraryBig },
      ],
    },
  ];
}

function resolveProjectSlug(pathname: string, projectSlug?: string): string | null {
  if (projectSlug) {
    return projectSlug;
  }

  const match = pathname.match(/^\/projects\/([^/]+)/);
  return match?.[1] ?? null;
}

export function Sidebar({
  workspaceLabel,
  userEmail,
  userAvatarUrl,
  projectSlug,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const activeProjectSlug = resolveProjectSlug(pathname, projectSlug);
  const navGroups = activeProjectSlug ? buildProjectNav(activeProjectSlug) : buildWorkspaceNav();
  const workspaceCompactLabel = workspaceLabel.slice(0, 2).toUpperCase() || "WS";
  const title = activeProjectSlug ? "Project Command Center" : "Workspace Command Center";

  return (
    <aside
      className={cn(
        "sticky top-0 flex h-screen shrink-0 flex-col border-r tech-border bg-panel/95 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-[5.5rem]" : "w-80"
      )}
    >
      <div className="border-b tech-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm">
            <Logo className="h-6 w-6 text-background" />
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Ward
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {title}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border tech-border bg-background text-muted-foreground transition-colors hover:bg-panel-hover hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div
          className={cn(
            "mt-4 rounded-2xl border tech-border bg-background/80 p-3 transition-all",
            collapsed && "px-2 py-3 text-center"
          )}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Workspace
          </p>
          <p className={cn("mt-2 truncate text-sm font-medium text-foreground", collapsed && "mt-1 text-xs")}>
            {collapsed ? workspaceCompactLabel : workspaceLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed ? (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {group.label}
              </p>
            ) : null}
            <div className={cn("space-y-1.5", !collapsed && "mt-3")}>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center rounded-2xl px-3 py-3 text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-foreground/25",
                      collapsed ? "justify-center" : "gap-3",
                      isActive
                        ? "bg-foreground text-background shadow-sm"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-background" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t tech-border px-3 py-4">
        <div className="space-y-1.5">
          <Link
            href="/settings"
            className={cn(
              "flex items-center rounded-2xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
              collapsed ? "justify-center" : "gap-3"
            )}
            title={collapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Settings</span> : null}
          </Link>
          <Link
            href={DASHBOARD_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "flex items-center rounded-2xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
              collapsed ? "justify-center" : "gap-3"
            )}
            title={collapsed ? "Docs" : undefined}
          >
            <LibraryBig className="h-4 w-4 shrink-0" />
            {!collapsed ? <span>Docs</span> : null}
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border tech-border bg-background/80 p-3">
          <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-3")}>
            {userAvatarUrl ? (
              <div
                aria-hidden="true"
                className="h-10 w-10 rounded-2xl bg-cover bg-center"
                style={{ backgroundImage: `url(${userAvatarUrl})` }}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground/10 text-xs font-semibold text-foreground">
                {getInitials(userEmail)}
              </div>
            )}

            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{userEmail}</p>
                <p className="text-xs text-muted-foreground">Workspace operator</p>
              </div>
            ) : null}
          </div>

          <form action="/auth/sign-out" method="post" className={cn("mt-3", collapsed && "text-center")}>
            <button
              type="submit"
              className={cn(
                "rounded-xl border tech-border bg-panel px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-panel-hover hover:text-foreground",
                collapsed && "w-full"
              )}
            >
              {collapsed ? "Out" : "Sign out"}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
