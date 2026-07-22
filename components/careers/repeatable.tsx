"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Generic repeatable block editor for the talent-pool CV form. Renders each
 * item in a fieldset with add/remove controls. `render` receives the item, a
 * patch updater, and the index.
 */
export function Repeatable<T>({
  legend,
  hint,
  items,
  blank,
  onChange,
  render,
  addLabel = "Add another",
}: {
  legend: string;
  hint?: string;
  items: T[];
  blank: () => T;
  onChange: (items: T[]) => void;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  addLabel?: string;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, blank()]);

  return (
    <fieldset className="space-y-3">
      <legend className="font-display text-lg font-semibold">{legend}</legend>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}

      {items.map((item, i) => (
        <div key={i} className="relative rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
              {legend} {i + 1}
            </p>
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${legend} ${i + 1}`} onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="mt-3">{render(item, (patch) => update(i, patch), i)}</div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </fieldset>
  );
}
