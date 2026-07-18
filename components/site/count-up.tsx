"use client";

import { useEffect, useRef } from "react";

/**
 * Animates a stat like "5,500+" counting up when first scrolled into view.
 * Renders the final value on the server; under prefers-reduced-motion or
 * without JS it simply stays static.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const match = value.match(/^([^0-9]*)([\d,]+)(.*)$/);
    if (!match) return;
    const [, prefix, digits, suffix] = match;
    const target = parseInt(digits.replace(/,/g, ""), 10);
    if (!Number.isFinite(target) || target === 0) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      const duration = 1200;
      const start = performance.now();
      const format = (n: number) => prefix + n.toLocaleString("en-US") + suffix;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        element.textContent = format(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
