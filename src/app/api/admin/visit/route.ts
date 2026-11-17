import geoip from 'geoip-lite'
import { UAParser, type IResult } from 'ua-parser-js'
import { requireAdmin } from '@/lib/server/auth'
import sql, { ensureDB } from '@/lib/server/db'
import { isDatacenterIp } from '@/lib/server/datacenters'
import { lookupNetwork, type Network } from '@/lib/server/network'

type View = {
  id: number
  path: string
  referrer: string | null
  timestamp: string
  ip_address: string | null
  user_agent: string | null
  country: string | null
  device_type: string | null
}

const HOSTING =
  /hosting|cloud|server|data ?cent|leaseweb|amazon|google|microsoft|digitalocean|ovh|hetzner|linode|akamai|vultr|contabo|m247|choopa|oracle|alibaba|tencent/i

const cairo = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', ...opts }).format(d)

/**
 * Plain-language reading of a visit: who it probably is and how they came.
 * Guesses from the network, browser and visit pattern, so worded as such.
 */
function describe(
  view: View,
  agent: IResult,
  network: Network | null,
  history: { views: number; days: number; first: string },
) {
  const notes: string[] = []
  const ip = view.ip_address || ''

  if (isDatacenterIp(ip) || (network?.holder && HOSTING.test(network.holder))) {
    notes.push(
      `Hosting or cloud network${network?.holder ? ` (${network.holder})` : ''}: almost certainly a bot, link scanner or VPN, not a person.`,
    )
  } else if (network?.holder) {
    notes.push(`Internet provider: ${network.holder}. Most likely a real person.`)
  }

  if (agent.browser.type === 'inapp' && agent.browser.name) {
    notes.push(
      `Opened inside the ${agent.browser.name} app: someone tapped a link to your site there.`,
    )
  }

  const ref = view.referrer
  if (ref && ref !== 'direct' && ref !== 'internal') {
    const host = ref.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
    notes.push(`Came from ${host}.`)
  } else if (!ref || ref === 'direct') {
    notes.push(
      'No referring site: the address was typed, bookmarked, or opened from an app, email or PDF (such as your CV).',
    )
  }

  if (history.days > 1) {
    notes.push(
      `Came back: ${history.views} views on ${history.days} different days from this address, first on ${cairo(new Date(history.first), { dateStyle: 'medium' })}.`,
    )
  } else if (history.views > 1) {
    notes.push(`${history.views} page views from this address, all on one day.`)
  }

  if (view.country === 'EG') {
    const at = new Date(view.timestamp)
    const day = cairo(at, { weekday: 'short' })
    const hour = Number(cairo(at, { hour: 'numeric', hour12: false }))
    if (!['Fri', 'Sat'].includes(day) && hour >= 9 && hour < 17) {
      notes.push('During working hours in Cairo (Sun–Thu, 9:00–17:00).')
    }
  }

  return notes
}

/** Everything known about one page view, for the admin's visit details. */
export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const id = Number(new URL(req.url).searchParams.get('id'))
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: 'A page view id is required' }, { status: 400 })
  }

  try {
    await ensureDB()
    const [view] = (await sql`
      SELECT id, path, referrer, timestamp, ip_address, user_agent, country, device_type
      FROM page_views WHERE id = ${id}
    `) as View[]
    if (!view) return Response.json({ error: 'Visit not found' }, { status: 404 })

    const ip = view.ip_address || ''
    const [historyRows, visitRows, network] = await Promise.all([
      sql`SELECT COUNT(*)::int AS views, COUNT(DISTINCT timestamp::date)::int AS days,
            MIN(timestamp) AS first, MAX(timestamp) AS last
          FROM page_views WHERE ip_address = ${ip}`,
      sql`SELECT timestamp, path, referrer FROM page_views
          WHERE ip_address = ${ip} ORDER BY timestamp DESC LIMIT 30`,
      lookupNetwork(ip),
    ])
    const history = historyRows[0] as { views: number; days: number; first: string; last: string }
    const visits = visitRows as { timestamp: string; path: string; referrer: string | null }[]

    const agent = new UAParser(view.user_agent || '').getResult()
    const place = geoip.lookup(ip)

    return Response.json({
      ip,
      time: view.timestamp,
      path: view.path,
      referrer: view.referrer,
      network,
      hosting: isDatacenterIp(ip),
      location: {
        country: view.country,
        city: place?.city || null,
        region: place?.region || null,
      },
      device: {
        type: agent.device.type || view.device_type || 'desktop',
        vendor: agent.device.vendor || null,
        model: agent.device.model || null,
      },
      os: [agent.os.name, agent.os.version].filter(Boolean).join(' ') || null,
      browser: [agent.browser.name, agent.browser.version].filter(Boolean).join(' ') || null,
      inApp: agent.browser.type === 'inapp' ? agent.browser.name || 'an app' : null,
      engine: [agent.engine.name, agent.engine.version].filter(Boolean).join(' ') || null,
      userAgent: view.user_agent,
      history,
      visits,
      notes: describe(view, agent, network, history),
    })
  } catch (err) {
    console.error('Visit details error:', err)
    return Response.json({ error: 'Failed to load the visit' }, { status: 500 })
  }
}
