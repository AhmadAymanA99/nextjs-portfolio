import { describe, it, expect, vi } from 'vitest'

// No database in these tests: the limiter falls back to counting in memory
vi.mock('@/lib/server/db', () => ({
  ensureDB: async () => {
    throw new Error('POSTGRES_URL not set')
  },
}))

const { default: rateLimit } = await import('@/lib/server/rateLimit')

const request = (path: string, ip: string) =>
  new Request(`https://example.com${path}`, { headers: { 'x-forwarded-for': ip } })

describe('rateLimit (in-memory fallback)', () => {
  it('allows requests within limit', async () => {
    const limiter = rateLimit({ windowMs: 1000, max: 3 })
    for (let i = 0; i < 3; i++) {
      expect(await limiter(request('/a', '1.1.1.1'))).toBeNull()
    }
  })

  it('blocks requests over limit with a 429', async () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2 })
    expect(await limiter(request('/b', '2.2.2.2'))).toBeNull()
    expect(await limiter(request('/b', '2.2.2.2'))).toBeNull()
    const blocked = await limiter(request('/b', '2.2.2.2'))
    expect(blocked?.status).toBe(429)
    expect(blocked?.headers.get('Retry-After')).toBeTruthy()
  })

  it('tracks clients separately', async () => {
    const limiter = rateLimit({ windowMs: 1000, max: 1 })
    expect(await limiter(request('/c', '3.3.3.3'))).toBeNull()
    expect(await limiter(request('/c', '4.4.4.4'))).toBeNull()
  })
})
