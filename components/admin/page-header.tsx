/**
 * Consistent admin page header: evidence-bars marker + mono eyebrow, a display
 * title, an optional subtitle, and a right-aligned actions slot. Replaces the
 * ad-hoc <h1> used across admin pages.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/70 pb-5">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 flex items-center gap-2.5">
            <span className="evidence-bars" aria-hidden="true">
              <span /><span /><span /><span />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</span>
          </div>
        )}
        <h1 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-[1.7rem]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
