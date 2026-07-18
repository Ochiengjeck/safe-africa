import { cn } from "@/lib/utils";

/**
 * Section heading with the evidence-bars brand marker and a mono eyebrow —
 * the recurring structural device of the public site.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-3">
        <span className="evidence-bars" aria-hidden="true">
          <span /><span /><span /><span />
        </span>
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
      </div>
      <h2 className="font-display mt-3 text-3xl font-bold sm:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base text-muted-foreground">{intro}</p>}
    </div>
  );
}
