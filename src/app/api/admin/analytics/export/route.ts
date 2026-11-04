import { requireAdmin } from '@/lib/server/auth'
import sql, { ensureDB } from '@/lib/server/db'
import { describeAgent, humanViews, inRange, maskIP, parseDays } from '@/lib/server/pageViews'

function csvCell(value: unknown) {
  const s = value instanceof Date ? value.toISOString() : String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    await ensureDB()
    const days = parseDays(req)
    const rows = await sql`
      SELECT timestamp, path, referrer, country, device_type, ip_address, user_agent
      FROM page_views WHERE ${humanViews()} AND ${inRange(days)}
      ORDER BY timestamp DESC LIMIT 20000
    `

    const header = ['timestamp', 'path', 'referrer', 'country', 'device', 'browser', 'os', 'ip']
    const lines = rows.map((r) => {
      const { browser, os } = describeAgent(r.user_agent)
      return [
        r.timestamp,
        r.path,
        r.referrer,
        r.country,
        r.device_type,
        browser,
        os,
        maskIP(r.ip_address),
      ]
        .map(csvCell)
        .join(',')
    })

    const filename = `page-views-${days ? `${days}d` : 'all'}-${new Date().toISOString().slice(0, 10)}.csv`
    return new Response([header.join(','), ...lines].join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Analytics export error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
