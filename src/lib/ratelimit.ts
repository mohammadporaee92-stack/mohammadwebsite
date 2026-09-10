// Tiny in-memory rate limiter (per server instance).
// Good enough for login brute-force protection on a single VPS.
// For multi-instance deployments, swap with Redis/Upstash later.

const hits = new Map<string, number[]>();

export function rateLimit(key: string, maxHits: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= maxHits) {
    const retryAfter = Math.max(1, Math.ceil((arr[0] + windowMs - now) / 1000));
    return { ok: false, retryAfter };
  }
  arr.push(now);
  hits.set(key, arr);
  // prevent unbounded growth
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (v.length === 0 || now - v[v.length - 1] > windowMs) hits.delete(k);
      if (hits.size < 4000) break;
    }
  }
  return { ok: true, retryAfter: 0 };
}
