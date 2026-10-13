/**
 * Limiteur en mémoire par fenêtre glissante. Suffisant pour une instance unique ;
 * en production multi-instances, le remplacer par un stockage partagé (voir docs/DEPLOIEMENT.md).
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return function check(key: string, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - recent[0])) / 1000) }
    }
    recent.push(now)
    hits.set(key, recent)
    if (hits.size > 10_000) {
      for (const [entryKey, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(entryKey)
    }
    return { allowed: true, retryAfterSeconds: 0 }
  }
}
