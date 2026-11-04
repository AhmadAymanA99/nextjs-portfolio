import { UAParser } from 'ua-parser-js'
import sql from './db'
import { BOT_UA_PATTERN } from './analytics'

export const MAX_DAYS = 365

export function parseDays(req: Request) {
  const days = parseInt(new URL(req.url).searchParams.get('days') || '')
  return days > 0 ? Math.min(days, MAX_DAYS) : null
}

/**
 * Human page views only: drops admin/API paths and automated agents, including
 * rows recorded before tracking filtered them. A function so the DB client is
 * only created at request time.
 */
export function humanViews() {
  return sql`
  path NOT LIKE '/admin%' AND path NOT LIKE '/api%'
  AND COALESCE(user_agent, '') <> ''
  AND user_agent !~* ${BOT_UA_PATTERN}
`
}

export function inRange(days: number | null, offsetPeriods = 0) {
  if (!days) return offsetPeriods ? sql`FALSE` : sql`TRUE`
  const from = days * (offsetPeriods + 1)
  const to = days * offsetPeriods
  return sql`timestamp >= NOW() - make_interval(days => ${from}) AND timestamp < NOW() - make_interval(days => ${to})`
}

export function maskIP(ip: string | null) {
  if (!ip) return '—'
  const parts = ip.split('.')
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`
  const v6parts = ip.split(':')
  if (v6parts.length >= 4) return `${v6parts[0]}:${v6parts[1]}:xxxx:xxxx`
  return '—'
}

export function describeAgent(userAgent: string | null) {
  const parsed = userAgent ? new UAParser(userAgent).getResult() : null
  return { browser: parsed?.browser.name || '—', os: parsed?.os.name || '—' }
}
