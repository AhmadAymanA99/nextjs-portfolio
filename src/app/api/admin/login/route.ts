import { checkPassword, startSession } from '@/lib/server/auth'
import rateLimit from '@/lib/server/rateLimit'
import { recordOwner } from '@/lib/server/owner'

const limiter = rateLimit({ windowMs: 30000, max: 3 })

export async function POST(req: Request) {
  const limited = await limiter(req)
  if (limited) return limited

  const { password } = await req.json().catch(() => ({}))

  if (!checkPassword(password)) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  await recordOwner(req)
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': startSession() } })
}
