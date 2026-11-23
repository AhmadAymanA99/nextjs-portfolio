import geoip from 'geoip-lite'
import { UAParser } from 'ua-parser-js'
import sql, { ensureDB } from '@/lib/server/db'
import { getClientIp } from '@/lib/server/rateLimit'
import { isAutomated, isTrackablePath } from '@/lib/server/analytics'
import { isAction } from '@/lib/actions'

/**
 * Records a page view ({ path, referrer }) or an action such as a CV download
 * ({ action, path, target }), from real visitors only.
 */
export async function POST(req: Request) {
  try {
    const { path, referrer, action, target } = await req.json()
    const userAgent = req.headers.get('user-agent') || ''
    const ip = getClientIp(req)

    // Bots, and cloud networks (e-mail link scanners, crawlers, monitors)
    if (
      !isTrackablePath(path) ||
      (action !== undefined && !isAction(action)) ||
      isAutomated(userAgent, ip)
    ) {
      return new Response(null, { status: 204 })
    }

    await ensureDB()

    const country = req.headers.get('x-vercel-ip-country') || geoip.lookup(ip)?.country || 'Unknown'
    const device = new UAParser(userAgent).getResult().device.type || 'desktop'

    if (action) {
      const label = typeof target === 'string' ? target.slice(0, 200) : null
      await sql`
        INSERT INTO actions (name, target, path, user_agent, ip_address, country, device_type)
        VALUES (${action}, ${label}, ${path}, ${userAgent}, ${ip}, ${country}, ${device})
      `
    } else {
      await sql`
        INSERT INTO page_views (path, referrer, user_agent, ip_address, country, device_type)
        VALUES (${path}, ${referrer || 'direct'}, ${userAgent}, ${ip}, ${country}, ${device})
      `
    }

    return Response.json({ status: 'success' })
  } catch (error) {
    console.error('Tracking error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
