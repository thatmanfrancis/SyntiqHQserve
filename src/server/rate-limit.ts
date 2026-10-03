import { NextRequest } from "next/server";

const attempts = new Map<string, { count: number; resetAt: number }>();

// Counts requests per key and returns true once the key goes over the limit within the window.
// Counts are kept in memory, so they reset on restart and aren't shared between server instances.
export function isRateLimited(key: string, limit: number, windowMinutes: number) {
  const now = Date.now();

  if (attempts.size > 10000) {
    for (const [oldKey, entry] of attempts) {
      if (entry.resetAt < now) attempts.delete(oldKey);
    }
  }

  const entry = attempts.get(key);

  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + windowMinutes * 60 * 1000 });
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

export function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}
