const hits = new Map<string, { start: number; count: number }>()

export function getClientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

/**
 * In-memory, per-instance limiter. Returns a 429 response when the caller is
 * over the limit, or null when the request may proceed.
 */
export default function rateLimit({ windowMs = 60000, max = 10 } = {}) {
  return (req: Request): Response | null => {
    const now = Date.now()
    const key = `${getClientIp(req)}:${new URL(req.url).pathname}`

    let entry = hits.get(key)
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 }
      hits.set(key, entry)
    }

    entry.count++

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000)
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } },
      )
    }

    return null
  }
}
