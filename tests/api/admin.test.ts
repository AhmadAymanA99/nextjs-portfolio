// @vitest-environment node
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { neon } from '@neondatabase/serverless'

const pg = new PGlite()
const real = neon('postgresql://u:p@localhost/db')
function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  const q: any = real(strings, ...values)
  q.then = (res: any, rej: any) => {
    const { query, params } = q.queryData.toParameterizedQuery()
    return pg
      .query(query, params)
      .then((r: any) => r.rows)
      .then(res, rej)
  }
  return q
}

vi.mock('@/lib/server/db', () => ({
  default: sql,
  ensureDB: async () => sql,
  batch: (queries: unknown[]) => Promise.all(queries),
  isConnectionError: () => false,
}))
process.env.ADMIN_SECRET = 'secret'

const UA_HUMAN =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
const UA_PHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'

beforeAll(async () => {
  await pg.exec(`
    CREATE TABLE page_views (id SERIAL PRIMARY KEY, path TEXT, referrer TEXT, user_agent TEXT, ip_address TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(), country TEXT, device_type TEXT);
    CREATE TABLE contact_messages (id SERIAL PRIMARY KEY, name TEXT, email TEXT, subject TEXT DEFAULT '', message TEXT,
      is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE guestbook_entries (id SERIAL PRIMARY KEY, name TEXT, message TEXT, website TEXT DEFAULT '',
      approved BOOLEAN DEFAULT false, flagged BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
    INSERT INTO page_views (path, referrer, user_agent, ip_address, country, device_type, timestamp) VALUES
      ('/', 'https://www.linkedin.com/feed', '$UA_HUMAN', '1.1.1.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/posts/rehlte', 'internal', '$UA_HUMAN', '1.1.1.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/', 'direct', '$UA_PHONE', '2.2.2.2', 'SA', 'mobile', NOW() - interval '2 days'),
      ('/', 'https://google.com/', '$UA_HUMAN', '3.3.3.3', 'US', 'desktop', NOW() - interval '10 days'),
      ('/', 'direct', 'Mozilla/5.0 (compatible; Googlebot/2.1)', '9.9.9.9', 'US', 'desktop', NOW() - interval '1 day'),
      ('/', 'direct', 'Mozilla/5.0 HeadlessChrome/120', '9.9.9.8', 'US', 'desktop', NOW() - interval '1 day'),
      ('/admin/analytics', 'direct', '$UA_HUMAN', '1.1.1.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/', 'https://ahmad-ayman.vercel.app/', '$UA_HUMAN', '4.4.4.4', 'EG', 'desktop', NOW() - interval '1 day');
    INSERT INTO contact_messages (name, email, message) VALUES ('A', 'a@x.com', 'hi'), ('B', 'b@x.com', 'yo');
    INSERT INTO guestbook_entries (name, message, flagged) VALUES ('A', 'nice', false), ('S', 'casino', true);
  `)
})

async function auth() {
  const { createToken } = await import('@/lib/server/auth')
  return { Authorization: `Bearer ${createToken()}` }
}

// Runs the real route handlers against an in-memory Postgres (PGlite). Neon
// composes the SQL; we execute the resulting parameterized query locally.
describe('admin analytics', () => {
  it('counts only humans, compares periods, groups sources', async () => {
    const { GET } = await import('@/app/api/admin/analytics/route')
    const res = await GET(
      new Request('https://x/api/admin/analytics?days=7', { headers: await auth() }),
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.stats.views).toBe(4)
    expect(data.stats.visitors).toBe(3)
    expect(data.stats.prevViews).toBe(1)
    expect(data.stats.excludedBots).toBe(3)
    expect(data.dailyViews).toHaveLength(7)
    expect(data.referrers.map((r: any) => r.source).sort()).toEqual(['Direct', 'linkedin.com'])
  })

  it('all-time has no previous period', async () => {
    const { GET } = await import('@/app/api/admin/analytics/route')
    const data = await (
      await GET(new Request('https://x/api/admin/analytics', { headers: await auth() }))
    ).json()
    expect(data.stats.views).toBe(5)
    expect(data.stats.prevViews).toBeNull()
    expect(data.dailyViews).toHaveLength(90)
  })

  it('exports csv', async () => {
    const { GET } = await import('@/app/api/admin/analytics/export/route')
    const text = await (
      await GET(new Request('https://x/api/admin/analytics/export', { headers: await auth() }))
    ).text()
    expect(text.split('\n')).toHaveLength(6)
  })

  it('rejects missing token', async () => {
    const { GET } = await import('@/app/api/admin/analytics/route')
    expect((await GET(new Request('https://x/api/admin/analytics'))).status).toBe(401)
  })
})

describe('messages + guestbook bulk', () => {
  it('marks read and deletes', async () => {
    const m = await import('@/app/api/admin/messages/route')
    const h = { ...(await auth()), 'Content-Type': 'application/json' }
    expect(
      (
        await m.PATCH(
          new Request('https://x', {
            method: 'PATCH',
            headers: h,
            body: JSON.stringify({ ids: [1, 2], read: true }),
          }),
        )
      ).status,
    ).toBe(200)
    let list = (await (await m.GET(new Request('https://x', { headers: h }))).json()).messages
    expect(list.every((x: any) => x.is_read)).toBe(true)
    await m.DELETE(
      new Request('https://x', {
        method: 'DELETE',
        headers: h,
        body: JSON.stringify({ ids: [1] }),
      }),
    )
    list = (await (await m.GET(new Request('https://x', { headers: h }))).json()).messages
    expect(list).toHaveLength(1)
  })

  it('approves guestbook entries and clears flag', async () => {
    const g = await import('@/app/api/admin/guestbook/route')
    const h = { ...(await auth()), 'Content-Type': 'application/json' }
    await g.PATCH(
      new Request('https://x', {
        method: 'PATCH',
        headers: h,
        body: JSON.stringify({ ids: [1, 2], approved: true }),
      }),
    )
    const entries = (await (await g.GET(new Request('https://x', { headers: h }))).json()).entries
    expect(entries.every((e: any) => e.approved && !e.flagged)).toBe(true)
  })
})

describe('track', () => {
  it('skips bots and admin paths, records humans', async () => {
    const { POST } = await import('@/app/api/track/route')
    const post = (path: string, ua: string) =>
      POST(
        new Request('https://x/api/track', {
          method: 'POST',
          headers: { 'user-agent': ua, 'x-forwarded-for': '5.5.5.5' },
          body: JSON.stringify({ path, referrer: 'direct' }),
        }),
      )
    expect((await post('/', 'Googlebot/2.1')).status).toBe(204)
    expect((await post('/admin/login', UA_HUMAN)).status).toBe(204)
    expect((await post('/', UA_HUMAN)).status).toBe(200)
  })
})
