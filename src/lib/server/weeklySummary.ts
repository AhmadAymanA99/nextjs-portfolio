import sql, { batch, ensureDB } from './db'
import { escapeHtml } from './mail'
import { automatedIps, humanViews, inRange, topSources } from './pageViews'
import { siteUrl } from '@/lib/site'

type Row = Record<string, any>
type Ranked = { label: string; value: number }[]

export type WeeklySummary = {
  views: number
  visitors: number
  prevViews: number
  prevVisitors: number
  topPages: Ranked
  sources: Ranked
  countries: Ranked
  newMessages: number
  unreadMessages: number
  pendingGuestbook: number
}

/** Real-visitor traffic for the last 7 days against the 7 before, plus what's waiting in the admin. */
export async function getWeeklySummary(): Promise<WeeklySummary> {
  await ensureDB()
  const human = humanViews(await automatedIps())
  const week = sql`${human} AND ${inRange(7)}`
  const lastWeek = sql`${human} AND ${inRange(7, 1)}`

  const [[now], [before], pages, sources, countries, [inbox], [guestbook]] = await batch<Row[][]>([
    sql`SELECT COUNT(*)::int AS views, COUNT(DISTINCT ip_address)::int AS visitors
        FROM page_views WHERE ${week}`,
    sql`SELECT COUNT(*)::int AS views, COUNT(DISTINCT ip_address)::int AS visitors
        FROM page_views WHERE ${lastWeek}`,
    sql`SELECT path AS label, COUNT(*)::int AS value FROM page_views WHERE ${week}
        GROUP BY path ORDER BY value DESC LIMIT 5`,
    topSources(week, 5),
    sql`SELECT COALESCE(country, 'Unknown') AS label, COUNT(DISTINCT ip_address)::int AS value
        FROM page_views WHERE ${week} GROUP BY 1 ORDER BY value DESC LIMIT 5`,
    sql`SELECT
          COUNT(*) FILTER (WHERE created_at >= NOW() - interval '7 days')::int AS new,
          COUNT(*) FILTER (WHERE NOT is_read)::int AS unread
        FROM contact_messages`,
    sql`SELECT COUNT(*)::int AS pending FROM guestbook_entries
        WHERE NOT approved AND NOT COALESCE(flagged, false)`,
  ])

  return {
    views: now.views,
    visitors: now.visitors,
    prevViews: before.views,
    prevVisitors: before.visitors,
    topPages: pages as Ranked,
    sources: sources.map((s) => ({ label: s.source, value: s.visitors })),
    countries: countries as Ranked,
    newMessages: inbox.new,
    unreadMessages: inbox.unread,
    pendingGuestbook: guestbook.pending,
  }
}

function change(now: number, before: number) {
  if (!before) return now ? 'new' : 'no change'
  const pct = Math.round(((now - before) / before) * 100)
  return pct === 0 ? 'no change' : `${pct > 0 ? '+' : ''}${pct}% vs last week`
}

/** The summary as a plain-text and an HTML email. */
export function formatWeeklySummary(s: WeeklySummary) {
  const admin = `${siteUrl}/admin/analytics`
  const headline = [
    `Visitors: ${s.visitors} (${change(s.visitors, s.prevVisitors)})`,
    `Page views: ${s.views} (${change(s.views, s.prevViews)})`,
  ]
  const todo = [
    s.newMessages && `${s.newMessages} new message${s.newMessages === 1 ? '' : 's'} this week`,
    s.unreadMessages && `${s.unreadMessages} unread in the inbox`,
    s.pendingGuestbook &&
      `${s.pendingGuestbook} guestbook entr${s.pendingGuestbook === 1 ? 'y' : 'ies'} waiting for approval`,
  ].filter((x): x is string => Boolean(x))
  const lists: [string, Ranked][] = [
    ['Top pages', s.topPages],
    ['Traffic sources', s.sources],
    ['Countries', s.countries],
  ]

  const text = [
    'Your portfolio, last 7 days (real visitors only)',
    '',
    ...headline,
    ...lists.flatMap(([title, rows]) =>
      rows.length ? ['', `${title}:`, ...rows.map((r) => `  ${r.label}: ${r.value}`)] : [],
    ),
    ...(todo.length ? ['', 'Waiting for you:', ...todo.map((t) => `  ${t}`)] : []),
    '',
    `Dashboard: ${admin}`,
  ].join('\n')

  const list = (title: string, rows: Ranked) =>
    rows.length
      ? `<h3 style="margin:16px 0 4px">${title}</h3><table>${rows
          .map(
            (r) =>
              `<tr><td style="padding:2px 16px 2px 0">${escapeHtml(String(r.label))}</td><td>${r.value}</td></tr>`,
          )
          .join('')}</table>`
      : ''
  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5">
<h2 style="margin:0 0 8px">Your portfolio, last 7 days</h2>
<p style="margin:0 0 4px;color:#666">Real visitors only</p>
<p>${headline.map(escapeHtml).join('<br>')}</p>
${lists.map(([title, rows]) => list(title, rows)).join('\n')}
${todo.length ? `<h3 style="margin:16px 0 4px">Waiting for you</h3><p>${todo.map(escapeHtml).join('<br>')}</p>` : ''}
<p><a href="${admin}">Open the dashboard</a></p>
</div>`

  return {
    subject: `[Portfolio] Weekly summary: ${s.visitors} visitor${s.visitors === 1 ? '' : 's'}`,
    text,
    html,
  }
}
