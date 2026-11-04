import { UAParser } from 'ua-parser-js'
import { requireAdmin } from '@/lib/server/auth'
import sql, { ensureDB } from '@/lib/server/db'

function maskIP(ip) {
  if (!ip) return '—'
  const parts = ip.split('.')
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.xxx.xxx`
  const v6parts = ip.split(':')
  if (v6parts.length >= 4) return `${v6parts[0]}:${v6parts[1]}:xxxx:xxxx`
  return '—'
}

function percent(part: unknown, total: number) {
  return total ? Math.round((Number(part || 0) / total) * 100) : 0
}

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    await ensureDB()

    const days = parseInt(new URL(req.url).searchParams.get('days') || '') || null
    // Every query filters with `WHERE ${since}`, so "all time" is just TRUE.
    const since = days ? sql`timestamp >= NOW() - make_interval(days => ${days})` : sql`TRUE`

    const totalViewsResult = await sql`SELECT COUNT(*) as count FROM page_views WHERE ${since}`
    const totalViews = parseInt(totalViewsResult[0]?.count || 0)

    const uniqueVisitorsResult =
      await sql`SELECT COUNT(DISTINCT ip_address) as count FROM page_views WHERE ${since}`
    const uniqueVisitors = parseInt(uniqueVisitorsResult[0]?.count || 0)

    const topCountryResult =
      await sql`SELECT country, COUNT(*) as count FROM page_views WHERE ${since} GROUP BY country ORDER BY count DESC LIMIT 1`
    const topCountry = topCountryResult[0]?.country || null

    const deviceStatsResult =
      await sql`SELECT device_type, COUNT(*) as count FROM page_views WHERE ${since} GROUP BY device_type`

    const deviceDistribution = {
      mobile: percent(deviceStatsResult.find((d) => d.device_type === 'mobile')?.count, totalViews),
      desktop: percent(
        deviceStatsResult.find((d) => d.device_type === 'desktop')?.count,
        totalViews,
      ),
    }

    const dailyViewsResult = await sql`
      SELECT DATE(timestamp) as date, COUNT(*) as count
      FROM page_views WHERE ${since}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
      LIMIT 90
    `
    const dailyViews = dailyViewsResult.map((r) => ({
      date:
        r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date).slice(0, 10),
      views: Number(r.count),
    }))

    const topPagesResult = await sql`
      SELECT path, COUNT(*) as count
      FROM page_views
      WHERE ${since} AND path IS NOT NULL
      GROUP BY path
      ORDER BY count DESC
      LIMIT 10
    `
    const topPages = topPagesResult.map((r) => ({ path: r.path, views: Number(r.count) }))

    const countryBreakdownResult = await sql`
      SELECT country, COUNT(*) as count
      FROM page_views
      WHERE ${since} AND country IS NOT NULL
      GROUP BY country
      ORDER BY count DESC
      LIMIT 10
    `
    const countryBreakdown = countryBreakdownResult.map((r) => ({
      country: r.country,
      views: Number(r.count),
    }))

    const recentViewsResult =
      await sql`SELECT path, country, device_type, referrer, timestamp, ip_address, user_agent FROM page_views WHERE ${since} ORDER BY timestamp DESC LIMIT 50`

    const recentViews = recentViewsResult.map((view) => {
      const parsed = view.user_agent ? new UAParser(view.user_agent).getResult() : null
      let browser = '—'
      let os = '—'
      if (parsed) {
        browser = parsed.browser.name || '—'
        os = parsed.os.name || '—'
      }
      return {
        path: view.path,
        country: view.country,
        device_type: view.device_type,
        referrer: view.referrer,
        timestamp: view.timestamp,
        ip: maskIP(view.ip_address),
        browser,
        os,
      }
    })

    return Response.json({
      stats: {
        totalViews,
        uniqueVisitors,
        topCountry,
        deviceDistribution,
      },
      dailyViews,
      topPages,
      countryBreakdown,
      recentViews,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
