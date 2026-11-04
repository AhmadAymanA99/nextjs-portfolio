import { isBot } from 'ua-parser-js/helpers'

/**
 * Catches automated agents that ua-parser's isBot misses (headless browsers,
 * screenshot/preview services, HTTP libraries). Also used in SQL so that rows
 * recorded before filtering existed are excluded from stats.
 */
export const BOT_UA_PATTERN =
  'bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|screenshot|vercel|curl|wget|python|axios|node-fetch|go-http|java/|okhttp|facebookexternalhit|whatsapp|telegram'

const botRe = new RegExp(BOT_UA_PATTERN, 'i')

export function isTrackablePath(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('/admin') &&
    !path.startsWith('/api') &&
    path.length <= 500
  )
}

export function isAutomated(userAgent: string) {
  return !userAgent || botRe.test(userAgent) || isBot(userAgent)
}
