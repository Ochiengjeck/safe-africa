"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Briefcase,
  FileText,
  Newspaper,
  Users2,
  PanelsTopLeft,
  Megaphone,
  Mail,
  Trash2,
  UserCog,
  Settings,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { hasRole } from "@/lib/roles";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/generated/prisma/client";

type NavItem = { href: string; label: string; icon: LucideIcon; minRole: Role };
type NavGroup = { label: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, minRole: "EDITOR" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban, minRole: "EDITOR" },
      { href: "/admin/thematic-areas", label: "Thematic Areas", icon: Layers, minRole: "EDITOR" },
      { href: "/admin/services", label: "Services", icon: Briefcase, minRole: "EDITOR" },
      { href: "/admin/resources", label: "Resources", icon: FileText, minRole: "EDITOR" },
      { href: "/admin/media", label: "Media & Events", icon: Newspaper, minRole: "EDITOR" },
      { href: "/admin/team", label: "Team", icon: Users2, minRole: "EDITOR" },
      { href: "/admin/pages", label: "Page Content", icon: PanelsTopLeft, minRole: "EDITOR" },
    ],
  },
  {
    label: "Inbox",
    items: [
      { href: "/admin/careers", label: "Careers", icon: Megaphone, minRole: "ADMIN" },
      { href: "/admin/messages", label: "Messages", icon: Mail, minRole: "ADMIN" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/trash", label: "Trash", icon: Trash2, minRole: "EDITOR" },
      { href: "/admin/users", label: "Users", icon: UserCog, minRole: "SUPER_ADMIN" },
      { href: "/admin/settings", label: "Settings", icon: Settings, minRole: "SUPER_ADMIN" },
    ],
  },
];

function Nav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav aria-label="Admin" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {GROUPS.map((group) => {
        const items = group.items.filter((item) => hasRole(role, item.minRole));
        if (items.length === 0) return null;
        return (
          <div key={group.label}>
            <p className="px-3 pb-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 py-2 text-sm font-medium text-sidebar-foreground/85 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        active && "border-brand-gold bg-sidebar-accent text-sidebar-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function UserCard({ name, role }: { name: string; role: Role }) {
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center justify-between gap-2 rounded-md bg-sidebar-accent/60 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-sidebar-foreground">{name}</p>
          <Badge variant="outline" className="mt-1 border-white/20 text-[10px] text-sidebar-foreground/80">
            {role.replace("_", " ").toLowerCase()}
          </Badge>
        </div>
        <form action={logout}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="rounded-md p-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; role: Role };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const brand = (onNavigate?: () => void) => (
    <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5 border-b border-white/10 px-4 py-4">
      <Image src="/safe-africa-logo.png" alt="" width={34} height={34} className="rounded-md" />
      <span className="min-w-0">
        <span className="font-display block truncate text-sm font-bold text-sidebar-foreground">SAFE Africa</span>
        <span className="block font-mono text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
          Content studio
        </span>
      </span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar md:flex">
        {brand()}
        <Nav role={user.role} />
        <div className="px-6 pb-2">
          <span className="evidence-bars" aria-hidden="true">
            <span /><span /><span /><span />
          </span>
        </div>
        <UserCard name={user.name} role={user.role} />
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/safe-africa-logo.png" alt="" width={28} height={28} className="rounded" />
            <span className="font-display text-sm font-bold">SAFE Africa CMS</span>
          </Link>
          <button
            type="button"
            className="rounded-md p-1.5"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="admin-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <div id="admin-mobile-nav" className="absolute inset-y-0 left-0 flex w-72 flex-col bg-sidebar shadow-xl">
              {brand(() => setOpen(false))}
              <Nav role={user.role} onNavigate={() => setOpen(false)} />
              <UserCard name={user.name} role={user.role} />
            </div>
          </div>
        )}

        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
