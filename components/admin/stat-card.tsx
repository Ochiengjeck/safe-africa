import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatAccent = "primary" | "leaf" | "blue" | "gold" | "orange" | "plum";

// Tinted surface + solid icon chip per accent. Values/labels use ink tokens
// (not the accent) so text contrast holds in both light and dark modes.
const ACCENTS: Record<StatAccent, { tile: string; chip: string }> = {
  primary: { tile: "from-primary/10 to-primary/[0.03]", chip: "bg-primary text-primary-foreground" },
  leaf: { tile: "from-brand-leaf/15 to-brand-leaf/[0.04]", chip: "bg-brand-leaf text-white" },
  blue: { tile: "from-brand-blue/15 to-brand-blue/[0.04]", chip: "bg-brand-blue text-white" },
  gold: { tile: "from-brand-gold/20 to-brand-gold/[0.05]", chip: "bg-brand-gold text-[#3a2c05]" },
  orange: { tile: "from-brand-orange-deep/15 to-brand-orange-deep/[0.04]", chip: "bg-brand-orange-deep text-white" },
  plum: { tile: "from-[#6d4d9a]/15 to-[#6d4d9a]/[0.04]", chip: "bg-[#6d4d9a] text-white" },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "primary",
  sub,
  href,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accent?: StatAccent;
  sub?: string;
  href?: string;
}) {
  const a = ACCENTS[accent];
  const inner = (
    <div className={cn("group h-full rounded-xl border bg-gradient-to-br p-4 shadow-sm transition-all", a.tile, href && "hover:-translate-y-0.5 hover:shadow-md")}>
      <div className="flex items-start justify-between gap-2">
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg shadow-sm", a.chip)}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="font-display mt-3 text-3xl font-bold leading-none text-foreground">{value}</p>
      <p className="mt-1.5 text-sm font-medium text-foreground/70">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
