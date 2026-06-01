import { describe, it, expect } from 'vitest'
import rateLimit from '../../lib/rateLimit'

describe('rateLimit', () => {
  it('allows requests within limit', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 3 })
    const req = { url: '/a', headers: { 'x-forwarded-for': '1.1.1.1' }, socket: {} }
    const res = { setHeader: () => {}, status: () => res, json: () => {} }
    for (let i = 0; i < 3; i++) {
      expect(limiter(req, res)).toBe(true)
    }
  })

  it('blocks requests over limit', () => {
    const limiter = rateLimit({ windowMs: 1000, max: 2 })
    const req = { url: '/b', headers: { 'x-forwarded-for': '2.2.2.2' }, socket: {} }
    const res = { setHeader: () => {}, status: () => res, json: () => {} }
    expect(limiter(req, res)).toBe(true)
    expect(limiter(req, res)).toBe(true)
    const result = limiter(req, res)
    // blocked → calls res.status(429).json(...) → returns undefined
    expect(result).toBe(undefined)
  })
})
