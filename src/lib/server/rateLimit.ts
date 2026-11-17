import crypto from 'crypto'
import { ensureDB } from './db'

export function getClientIp(req: Request) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

type Hit = { count: number; resetAt: number }

/**
 * Counts one request against `key` in Postgres, so every serverless instance
 * shares the same count. A single upsert: starts a new window when the old one
 * has passed, otherwise adds one.
 */
async function hitDatabase(key: string, windowMs: number): Promise<Hit> {
  const sql = await ensureDB()
  const seconds = windowMs / 1000
  const [row] = (await sql`
    INSERT INTO rate_limits (key, window_start, count) VALUES (${key}, NOW(), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start <= NOW() - make_interval(secs => ${seconds})
                   THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start <= NOW() - make_interval(secs => ${seconds})
                          THEN NOW() ELSE rate_limits.window_start END
    RETURNING count, (EXTRACT(EPOCH FROM window_start) * 1000)::float8 AS start
  `) as { count: number; start: number }[]

  // Now and then, drop windows that ended long ago
  if (Math.random() < 0.02) {
    sql`DELETE FROM rate_limits WHERE window_start < NOW() - interval '1 day'`.catch(() => {})
  }
  return { count: row.count, resetAt: row.start + windowMs }
}

// Fallback when the database can't be reached: per instance, so weaker, but
// the forms stay protected and keep working
const memory = new Map<string, { start: number; count: number }>()

function hitMemory(key: string, windowMs: number): Hit {
  const now = Date.now()
  let entry = memory.get(key)
  if (!entry || now - entry.start >= windowMs) {
    entry = { start: now, count: 0 }
    memory.set(key, entry)
  }
  entry.count++
  return { count: entry.count, resetAt: entry.start + windowMs }
}

/**
 * Limits each client (by IP, stored hashed) to `max` requests per `windowMs`
 * on a route. Resolves to a 429 response when over the limit, or null when the
 * request may proceed.
 */
export default function rateLimit({ windowMs = 60000, max = 10 } = {}) {
  return async (req: Request): Promise<Response | null> => {
    const ip = crypto.createHash('sha256').update(getClientIp(req)).digest('hex').slice(0, 32)
    const key = `${new URL(req.url).pathname}:${ip}`

    let hit: Hit
    try {
      hit = await hitDatabase(key, windowMs)
    } catch {
      hit = hitMemory(key, windowMs)
    }

    if (hit.count <= max) return null
    const retryAfter = Math.max(1, Math.ceil((hit.resetAt - Date.now()) / 1000))
    return Response.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    )
  }
}
