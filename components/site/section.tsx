import { cn } from "@/lib/utils";

const VARIANTS = {
  default: "",
  muted: "border-y bg-muted/40",
  dark: "bg-sidebar text-sidebar-foreground",
} as const;

/** Standard page section: consistent vertical rhythm + background variants. */
export function Section({
  variant = "default",
  className,
  containerClassName,
  children,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(VARIANTS[variant], className)}>
      <div className={cn("mx-auto max-w-6xl px-4 py-16 sm:py-20 lg:py-24", containerClassName)}>{children}</div>
    </section>
  );
}
