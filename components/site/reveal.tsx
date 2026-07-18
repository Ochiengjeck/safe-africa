"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper. The hidden state is applied only after hydration
 * (and never under prefers-reduced-motion), so content is always visible
 * without JS and for motion-sensitive users; elements already in view
 * animate in immediately.
 */
export function Reveal({
  className,
  delay = 0,
  children,
}: {
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    element.classList.add("reveal");
    element.style.transitionDelay = `${delay}ms`;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
