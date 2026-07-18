import { headers } from "next/headers";

const hits = new Map<string, number[]>();

/**
 * Minimal in-memory rate limiter for public forms. Allows `limit` submissions
 * per `windowMs` per client IP. Good enough for spam damping on a single
 * serverless instance; swap for a durable store if abuse becomes real.
 */
export async function rateLimited(bucket: string, limit = 5, windowMs = 60_000) {
  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) return true;
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) hits.clear(); // crude memory guard
  return false;
}
