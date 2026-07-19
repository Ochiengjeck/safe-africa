import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { SavedToast } from "@/components/admin/saved-toast";
import { requireSession } from "@/lib/authz";
import { hasRole } from "@/lib/authz";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/lib/generated/prisma/client";

const NAV: { href: string; label: string; minRole: Role }[] = [
  { href: "/admin", label: "Dashboard", minRole: "EDITOR" },
  { href: "/admin/projects", label: "Projects", minRole: "EDITOR" },
  { href: "/admin/thematic-areas", label: "Thematic Areas", minRole: "EDITOR" },
  { href: "/admin/services", label: "Services", minRole: "EDITOR" },
  { href: "/admin/resources", label: "Resources", minRole: "EDITOR" },
  { href: "/admin/careers", label: "Careers", minRole: "ADMIN" },
  { href: "/admin/media", label: "Media & Events", minRole: "EDITOR" },
  { href: "/admin/team", label: "Team", minRole: "EDITOR" },
  { href: "/admin/pages", label: "Page Content", minRole: "EDITOR" },
  { href: "/admin/messages", label: "Messages", minRole: "ADMIN" },
  { href: "/admin/trash", label: "Trash", minRole: "EDITOR" },
  { href: "/admin/users", label: "Users", minRole: "SUPER_ADMIN" },
  { href: "/admin/settings", label: "Settings", minRole: "SUPER_ADMIN" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const role = session.user.role;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar md:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b px-4 py-4">
          <Image src="/safe-africa-logo.png" alt="" width={32} height={32} className="rounded" />
          <span className="text-sm font-semibold">SAFE Africa CMS</span>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {NAV.filter((item) => hasRole(role, item.minRole)).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3">
          <div className="flex items-center gap-2 px-3 pb-2">
            <p className="truncate text-xs text-muted-foreground">{session.user.name}</p>
            <Badge variant="outline" className="shrink-0 border-sidebar-accent text-sidebar-foreground">
              {role.replace("_", " ").toLowerCase()}
            </Badge>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b px-4 py-3 md:hidden">
          <span className="text-sm font-semibold">SAFE Africa CMS</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
      <Toaster position="bottom-right" richColors closeButton />
      <Suspense>
        <SavedToast />
      </Suspense>
    </div>
  );
}
