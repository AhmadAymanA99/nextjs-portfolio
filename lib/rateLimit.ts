const hits = new Map()

export default function rateLimit({ windowMs = 60000, max = 10 } = {}) {
  return (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
    const now = Date.now()
    const key = `${ip}:${req.url}`

    let entry = hits.get(key)
    if (!entry || now - entry.start > windowMs) {
      entry = { start: now, count: 0 }
      hits.set(key, entry)
    }

    entry.count++

    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count))

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.start + windowMs - now) / 1000)
      res.setHeader('Retry-After', retryAfter)
      return res.status(429).json({ error: 'Too many requests' })
    }

    return true
  }
}
