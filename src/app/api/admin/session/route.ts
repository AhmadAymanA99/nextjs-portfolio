import { endSession, requireAdmin } from '@/lib/server/auth'
import { recordOwner } from '@/lib/server/owner'

/**
 * 200 when the browser holds a valid admin session, 401 otherwise. Signed-in
 * browsers call it on every visit, so the owner's current address is
 * remembered and other devices on the same connection (a phone on home Wi-Fi)
 * aren't counted as visitors either.
 */
export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied
  await recordOwner(req)
  return Response.json({ ok: true })
}

/** Log out: clears the session cookie. */
export async function DELETE() {
  return Response.json({ ok: true }, { headers: { 'Set-Cookie': endSession() } })
}
