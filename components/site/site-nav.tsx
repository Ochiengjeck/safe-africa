"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

  const link = (href: string, label: string, mobile = false) => (
    <Link
      key={href}
      href={href}
      onClick={() => setOpen(false)}
      className={cn(
        "font-medium transition-colors hover:text-primary",
        mobile ? "block px-4 py-3 text-base" : "text-sm",
        (pathname === href || pathname.startsWith(href + "/")) && "text-primary"
      )}
    >
      {label}
    </Link>
  );

  return (
    <>
      <nav className="hidden items-center gap-5 lg:flex">
        {LINKS.map(({ href, label }) => link(href, label))}
        <Link
          href="/contact"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </nav>
      <button
        type="button"
        className="lg:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-16 border-b bg-background shadow-lg lg:hidden">
          {LINKS.map(({ href, label }) => link(href, label, true))}
          {link("/contact", "Contact Us", true)}
        </nav>
      )}
    </>
  );
}
