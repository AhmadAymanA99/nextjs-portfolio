import { requireAdmin } from '@/lib/server/auth'
import sql, { ensureDB } from '@/lib/server/db'
import { describeAgent, humanViews, inRange, maskIP, parseDays } from '@/lib/server/pageViews'
import { siteUrl } from '@/lib/site'

const siteHost = new URL(siteUrl).hostname

function percent(part: unknown, total: number) {
  return total ? Math.round((Number(part || 0) / total) * 100) : 0
}

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    await ensureDB()

    const days = parseDays(req)
    const current = sql`${humanViews()} AND ${inRange(days)}`
    const previous = sql`${humanViews()} AND ${inRange(days, 1)}`
    // The chart always shows a continuous range, capped at 90 days for "all time".
    const chartDays = days ?? 90

    const [[totals], [prevTotals], [bots], devices, daily, topPages, referrers, countries, recent] =
      await Promise.all([
        sql`SELECT COUNT(*)::int AS views, COUNT(DISTINCT ip_address)::int AS visitors
          FROM page_views WHERE ${current}`,
        sql`SELECT COUNT(*)::int AS views, COUNT(DISTINCT ip_address)::int AS visitors
          FROM page_views WHERE ${previous}`,
        sql`SELECT COUNT(*)::int AS count FROM page_views WHERE ${inRange(days)} AND NOT (${humanViews()})`,
        sql`SELECT COALESCE(device_type, 'desktop') AS device, COUNT(*)::int AS count
          FROM page_views WHERE ${current} GROUP BY 1`,
        sql`SELECT d::date::text AS date,
                 COUNT(pv.id)::int AS views,
                 COUNT(DISTINCT pv.ip_address)::int AS visitors
          FROM generate_series(CURRENT_DATE - ${chartDays - 1}::int, CURRENT_DATE, '1 day') d
          LEFT JOIN page_views pv ON pv.timestamp::date = d::date AND ${humanViews()}
          GROUP BY d ORDER BY d`,
        sql`SELECT path, COUNT(*)::int AS views, COUNT(DISTINCT ip_address)::int AS visitors
          FROM page_views WHERE ${current}
          GROUP BY path ORDER BY views DESC LIMIT 10`,
        sql`SELECT source, COUNT(DISTINCT ip_address)::int AS visitors FROM (
            SELECT ip_address,
              CASE WHEN referrer IS NULL OR referrer IN ('', 'direct') THEN 'Direct'
                   ELSE substring(referrer from '^https?://(?:www\\.)?([^/:?#]+)') END AS source
            FROM page_views WHERE ${current} AND COALESCE(referrer, '') <> 'internal'
          ) r
          WHERE source IS NOT NULL AND source <> ${siteHost} AND source NOT LIKE '%localhost%'
          GROUP BY source ORDER BY visitors DESC LIMIT 10`,
        sql`SELECT COALESCE(country, 'Unknown') AS country, COUNT(DISTINCT ip_address)::int AS visitors
          FROM page_views WHERE ${current}
          GROUP BY 1 ORDER BY visitors DESC LIMIT 10`,
        sql`SELECT path, country, device_type, referrer, timestamp, ip_address, user_agent
          FROM page_views WHERE ${current} ORDER BY timestamp DESC LIMIT 50`,
      ])

    const deviceCount = (name: string) => devices.find((d) => d.device === name)?.count ?? 0

    return Response.json({
      days,
      chartDays,
      stats: {
        views: totals.views,
        visitors: totals.visitors,
        // Only meaningful when a range is selected
        prevViews: days ? prevTotals.views : null,
        prevVisitors: days ? prevTotals.visitors : null,
        viewsPerVisitor: totals.visitors ? +(totals.views / totals.visitors).toFixed(1) : 0,
        topCountry: countries[0]?.country ?? null,
        excludedBots: bots.count,
        devices: {
          desktop: percent(deviceCount('desktop'), totals.views),
          mobile: percent(deviceCount('mobile'), totals.views),
          tablet: percent(deviceCount('tablet'), totals.views),
        },
      },
      dailyViews: daily,
      topPages,
      referrers,
      countries,
      recentViews: recent.map((v) => ({
        path: v.path,
        country: v.country,
        device_type: v.device_type,
        referrer: v.referrer,
        timestamp: v.timestamp,
        ip: maskIP(v.ip_address),
        ...describeAgent(v.user_agent),
      })),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
