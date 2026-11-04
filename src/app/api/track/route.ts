import geoip from 'geoip-lite'
import { UAParser } from 'ua-parser-js'
import sql, { ensureDB } from '@/lib/server/db'
import { getClientIp } from '@/lib/server/rateLimit'
import { isAutomated, isTrackablePath } from '@/lib/server/analytics'

export async function POST(req: Request) {
  try {
    const { path, referrer } = await req.json()
    const userAgent = req.headers.get('user-agent') || ''

    if (!isTrackablePath(path) || isAutomated(userAgent)) {
      return new Response(null, { status: 204 })
    }

    await ensureDB()

    const ip = getClientIp(req)
    const country = req.headers.get('x-vercel-ip-country') || geoip.lookup(ip)?.country || 'Unknown'
    const ua = new UAParser(userAgent).getResult()

    await sql`
      INSERT INTO page_views (path, referrer, user_agent, ip_address, country, device_type)
      VALUES (${path}, ${referrer || 'direct'}, ${userAgent}, ${ip}, ${country}, ${ua.device.type || 'desktop'})
    `

    return Response.json({ status: 'success' })
  } catch (error) {
    console.error('Tracking error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
