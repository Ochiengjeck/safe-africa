"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/thematic-areas", label: "Thematic Areas" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/resources", label: "Resources" },
  { href: "/media-events", label: "Media & Events" },
  { href: "/careers", label: "Careers" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change, Escape, and lock body scroll while open.
  useEffect(() => setOpen(false), [pathname]);
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn(
              "relative py-1 text-sm font-medium transition-colors hover:text-primary",
              "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brand-leaf after:opacity-0 after:transition-opacity",
              isActive(href) && "text-primary after:opacity-100"
            )}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/contact"
          aria-current={isActive("/contact") ? "page" : undefined}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </nav>

      <button
        type="button"
        className="rounded-md p-1.5 lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Main"
          className="mobile-menu-enter absolute inset-x-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b bg-background shadow-lg lg:hidden"
        >
          {[...LINKS, { href: "/contact", label: "Contact Us" }].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "block border-l-2 border-transparent px-4 py-3 text-base font-medium transition-colors hover:text-primary",
                isActive(href) && "border-brand-leaf bg-secondary/50 text-primary"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
