import { UAParser } from 'ua-parser-js'
import sql from './db'
import { BOT_UA_PATTERN } from './analytics'
import { isDatacenterIp } from './datacenters'
import { siteUrl } from '@/lib/site'

export const MAX_DAYS = 365

export function parseDays(req: Request) {
  const days = parseInt(new URL(req.url).searchParams.get('days') || '')
  return days > 0 ? Math.min(days, MAX_DAYS) : null
}

/**
 * Addresses in the table that belong to cloud/crawler networks or the dev
 * machine. Looked up in code (the ranges don't fit in SQL), so rows recorded
 * before tracking filtered them are excluded too.
 */
export async function automatedIps() {
  const rows = (await sql`SELECT DISTINCT ip_address FROM page_views`) as {
    ip_address: string | null
  }[]
  return rows.map((r) => r.ip_address).filter((ip): ip is string => isDatacenterIp(ip))
}

/**
 * Human page views only: drops admin/API paths, automated agents, the
 * `excludedIps` from automatedIps() and the owner's own visits. A function so
 * the DB client is only created at request time.
 *
 * Owner visits: a view is the owner's when it came from an address the owner
 * used within a day of it (owner_ips). Home addresses change and get handed to
 * other people later, so an address only counts as the owner's around the days
 * it was seen as theirs. Columns are unqualified so this also works when the
 * caller gives page_views an alias.
 */
export function humanViews(excludedIps: string[]) {
  return sql`
  path NOT LIKE '/admin%' AND path NOT LIKE '/api%'
  AND COALESCE(user_agent, '') <> ''
  AND user_agent !~* ${BOT_UA_PATTERN}
  AND COALESCE(ip_address, '') <> ALL(${excludedIps}::text[])
  AND NOT EXISTS (
    SELECT 1 FROM owner_ips o
    WHERE o.ip = ip_address AND timestamp::date BETWEEN o.day - 1 AND o.day + 1
  )
`
}

/**
 * Remembers `ip` as the owner's on the day of `at` (default: today), which
 * leaves out every view from that address from the day before to the day after.
 */
export function rememberOwnerIp(ip: string, at: Date | string = new Date()) {
  return sql`
    INSERT INTO owner_ips (ip, day) VALUES (${ip}, (${new Date(at).toISOString()}::timestamptz)::date)
    ON CONFLICT DO NOTHING
  `
}

export function inRange(days: number | null, offsetPeriods = 0) {
  if (!days) return offsetPeriods ? sql`FALSE` : sql`TRUE`
  const from = days * (offsetPeriods + 1)
  const to = days * offsetPeriods
  return sql`timestamp >= NOW() - make_interval(days => ${from}) AND timestamp < NOW() - make_interval(days => ${to})`
}

const siteHost = new URL(siteUrl).hostname

/**
 * Visitors per traffic source (the referring site, or "Direct") among the
 * views matching `where`. Moves between the site's own pages are left out.
 */
export function topSources(where: ReturnType<typeof sql>, limit: number) {
  return sql`SELECT source, COUNT(DISTINCT ip_address)::int AS visitors FROM (
      SELECT ip_address,
        CASE WHEN referrer IS NULL OR referrer IN ('', 'direct') THEN 'Direct'
             ELSE substring(referrer from '^https?://(?:www\\.)?([^/:?#]+)') END AS source
      FROM page_views WHERE ${where} AND COALESCE(referrer, '') <> 'internal'
    ) r
    WHERE source IS NOT NULL AND source <> ${siteHost} AND source NOT LIKE '%localhost%'
    GROUP BY source ORDER BY visitors DESC LIMIT ${limit}`
}

export function describeAgent(userAgent: string | null) {
  const parsed = userAgent ? new UAParser(userAgent).getResult() : null
  return { browser: parsed?.browser.name || '—', os: parsed?.os.name || '—' }
}
