import { checkPassword, createToken } from '@/lib/server/auth'
import rateLimit from '@/lib/server/rateLimit'

const limiter = rateLimit({ windowMs: 30000, max: 3 })

export async function POST(req: Request) {
  const limited = limiter(req)
  if (limited) return limited

  const { password } = await req.json().catch(() => ({}))

  if (!checkPassword(password)) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  return Response.json({ token: createToken() })
}
