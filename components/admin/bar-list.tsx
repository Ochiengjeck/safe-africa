import { cn } from "@/lib/utils";
import type { StatAccent } from "@/components/admin/stat-card";

type BarAccent = StatAccent | "muted";

// Solid bar fills per accent. Labels and values wear ink tokens; the colored
// bar carries identity (per the dataviz text-token rule).
const BAR_COLORS: Record<BarAccent, string> = {
  primary: "bg-primary",
  leaf: "bg-brand-leaf",
  blue: "bg-brand-blue",
  gold: "bg-brand-gold",
  orange: "bg-brand-orange-deep",
  plum: "bg-[#6d4d9a]",
  muted: "bg-muted-foreground/45",
};

export type BarItem = { label: string; value: number; accent?: BarAccent };

/** Dependency-free horizontal bar list for pipelines and breakdowns. */
export function BarList({ items, labelWidth = "6rem" }: { items: BarItem[]; labelWidth?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No data yet.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="shrink-0 truncate text-sm text-foreground/80" style={{ width: labelWidth }}>{item.label}</span>
          <span className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <span
              className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-500", BAR_COLORS[item.accent ?? "primary"])}
              style={{ width: `${Math.max(item.value === 0 ? 0 : 4, (item.value / max) * 100)}%` }}
            />
          </span>
          <span className="w-9 shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-foreground">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
