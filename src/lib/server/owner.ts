import { ensureDB } from './db'
import { rememberOwnerIp } from './pageViews'
import { getClientIp } from './rateLimit'

/**
 * Remembers the address of a signed-in admin request as the owner's for today,
 * so the owner's visits from any device on that connection aren't counted.
 * Never throws: the admin must keep working if this fails.
 */
export async function recordOwner(req: Request) {
  const ip = getClientIp(req)
  if (ip === 'unknown') return
  try {
    await ensureDB()
    await rememberOwnerIp(ip)
  } catch (err) {
    console.error('Could not remember owner address:', err)
  }
}
