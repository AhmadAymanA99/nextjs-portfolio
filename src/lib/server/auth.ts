import crypto from 'crypto'

function getSecret(): string {
  const s = process.env.ADMIN_SECRET
  if (!s) throw new Error('ADMIN_SECRET not set')
  return s
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

export function checkPassword(password: unknown) {
  return typeof password === 'string' && safeEqual(password, getSecret())
}

const SESSION_MS = 24 * 60 * 60 * 1000

/** Name of the admin session cookie. */
export const SESSION_COOKIE = 'admin_session'

export function createToken() {
  const secret = getSecret()
  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + SESSION_MS })
  const base64 = Buffer.from(payload).toString('base64url')
  const signature = crypto.createHmac('sha256', secret).update(base64).digest('hex')
  return `${base64}.${signature}`
}

export function verifyToken(token: string) {
  try {
    const secret = getSecret()
    const [base64, signature] = token.split('.')
    const expected = crypto.createHmac('sha256', secret).update(base64).digest('hex')
    if (!signature || !safeEqual(signature, expected)) return null
    const payload = JSON.parse(Buffer.from(base64, 'base64url').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

/**
 * The session lives in an HttpOnly cookie, so page scripts (and anything
 * injected into them) can't read it. It is only sent to /api/admin and never
 * on requests started by other sites (SameSite=Strict).
 */
function sessionCookie(value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE}=${value}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`
}

export const startSession = () => sessionCookie(createToken(), SESSION_MS / 1000)
export const endSession = () => sessionCookie('', 0)

function readCookie(req: Request, name: string) {
  for (const part of (req.headers.get('cookie') || '').split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=')
  }
  return null
}

/** Changes must come from this site; browsers send Origin on POST/PATCH/DELETE. */
function sameOrigin(req: Request) {
  const origin = req.headers.get('origin')
  return !origin || origin === new URL(req.url).origin
}

/** Returns a 401/403 response unless the request carries a valid admin session. */
export function requireAdmin(req: Request): Response | null {
  const token = readCookie(req, SESSION_COOKIE)
  if (!token || !verifyToken(token)) {
    return Response.json({ error: 'Not signed in or session expired' }, { status: 401 })
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) {
    return Response.json({ error: 'Cross-site request blocked' }, { status: 403 })
  }
  return null
}

/** Reads `{ ids: number[] }` (or a single `id`) from an admin request body. */
export async function readIds(
  req: Request,
): Promise<{ ids: number[]; body: Record<string, unknown> }> {
  const body = await req.json().catch(() => ({}))
  const raw = Array.isArray(body.ids) ? body.ids : body.id != null ? [body.id] : []
  const ids = raw.map(Number).filter((n: number) => Number.isInteger(n) && n > 0)
  return { ids, body }
}
