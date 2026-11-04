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

export function createToken() {
  const secret = getSecret()
  const payload = JSON.stringify({
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  })
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

/** Returns a 401 response unless the request carries a valid admin bearer token. */
export function requireAdmin(req: Request): Response | null {
  const auth = req.headers.get('authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!verifyToken(auth.slice(7))) {
    return Response.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
  return null
}
