import { describe, expect, it } from 'vitest'

import { createRateLimiter } from '@/lib/elle/rate-limit'

describe('createRateLimiter', () => {
  it('bloque au-delà de la limite puis libère après la fenêtre', () => {
    const check = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(check('a', 0).allowed).toBe(true)
    expect(check('a', 10).allowed).toBe(true)
    const blocked = check('a', 20)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterSeconds).toBe(1)
    expect(check('b', 20).allowed).toBe(true)
    expect(check('a', 1001).allowed).toBe(true)
  })
})
