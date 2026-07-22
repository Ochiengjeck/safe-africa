/**
 * Dark-green page header band used at the top of every inner page — carries
 * the evidence-bars marker, a mono eyebrow, the display title, and an intro.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-18 lg:py-20">
        <div className="flex items-center gap-3">
          <span className="evidence-bars" aria-hidden="true">
            <span /><span /><span /><span />
          </span>
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-brand-gold">{eyebrow}</p>
        </div>
        <h1 className="font-display mt-4 max-w-3xl text-3xl font-bold sm:text-4xl lg:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-base opacity-85 sm:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
