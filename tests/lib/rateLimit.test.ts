import { describe, it, expect } from 'vitest'
import rateLimit from '@/lib/server/rateLimit'

const request = (path: string, ip: string) =>
  new Request(`https://example.com${path}`, { headers: { 'x-forwarded-for': ip } })

describe('rateLimit', () => {
  it('allows requests within limit', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 3 })
    for (let i = 0; i < 3; i++) {
      expect(limiter(request('/a', '1.1.1.1'))).toBeNull()
    }
  })

  it('blocks requests over limit with a 429', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2 })
    expect(limiter(request('/b', '2.2.2.2'))).toBeNull()
    expect(limiter(request('/b', '2.2.2.2'))).toBeNull()
    const blocked = limiter(request('/b', '2.2.2.2'))
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get('Retry-After')).toBeTruthy()
  })

  it('tracks clients separately', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 1 })
    expect(limiter(request('/c', '3.3.3.3'))).toBeNull()
    expect(limiter(request('/c', '4.4.4.4'))).toBeNull()
  })
})
