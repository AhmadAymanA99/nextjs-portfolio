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
    CREATE TABLE ip_networks (ip TEXT PRIMARY KEY, asn TEXT, holder TEXT, prefix TEXT,
      fetched_at TIMESTAMPTZ DEFAULT NOW());
    CREATE TABLE owner_ips (ip TEXT NOT NULL, day DATE NOT NULL, PRIMARY KEY (ip, day));
    CREATE TABLE actions (id SERIAL PRIMARY KEY, name TEXT NOT NULL, target TEXT, path TEXT, user_agent TEXT,
      ip_address TEXT, timestamp TIMESTAMPTZ DEFAULT NOW(), country TEXT, device_type TEXT);
    CREATE TABLE rate_limits (key TEXT PRIMARY KEY, window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      count INT NOT NULL DEFAULT 0);
    INSERT INTO page_views (path, referrer, user_agent, ip_address, country, device_type, timestamp) VALUES
      ('/', 'https://www.linkedin.com/feed', '$UA_HUMAN', '192.0.2.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/posts/rehlte', 'internal', '$UA_HUMAN', '192.0.2.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/', 'direct', '$UA_PHONE', '192.0.2.2', 'SA', 'mobile', NOW() - interval '2 days'),
      ('/', 'https://google.com/', '$UA_HUMAN', '192.0.2.3', 'US', 'desktop', NOW() - interval '10 days'),
      ('/', 'direct', 'Mozilla/5.0 (compatible; Googlebot/2.1)', '192.0.2.9', 'US', 'desktop', NOW() - interval '1 day'),
      ('/', 'direct', 'Mozilla/5.0 HeadlessChrome/120', '192.0.2.8', 'US', 'desktop', NOW() - interval '1 day'),
      ('/admin/analytics', 'direct', '$UA_HUMAN', '192.0.2.1', 'EG', 'desktop', NOW() - interval '1 day'),
      ('/', 'https://ahmad-ayman.vercel.app/', '$UA_HUMAN', '192.0.2.4', 'EG', 'desktop', NOW() - interval '1 day'),
      -- A scanner that looks like Chrome, from Google's crawler network
      ('/', 'direct', '$UA_HUMAN', '66.249.66.1', 'US', 'desktop', NOW() - interval '1 day'),
      -- The development machine
      ('/', 'direct', '$UA_HUMAN', '::1', 'Unknown', 'desktop', NOW() - interval '1 day');
    INSERT INTO actions (name, target, path, user_agent, ip_address, timestamp) VALUES
      ('cv_download', NULL, '/', '$UA_HUMAN', '192.0.2.1', NOW() - interval '1 day'),
      ('live_site', 'rehlte', '/posts/rehlte', '$UA_PHONE', '192.0.2.2', NOW() - interval '2 days'),
      ('live_site', 'rehlte', '/posts/rehlte', '$UA_HUMAN', '192.0.2.1', NOW() - interval '2 days'),
      -- Older than a week
      ('cv_download', NULL, '/', '$UA_HUMAN', '192.0.2.3', NOW() - interval '10 days'),
      -- A bot and a cloud network: never counted
      ('contact_click', NULL, '/', 'Mozilla/5.0 HeadlessChrome/120', '192.0.2.8', NOW() - interval '1 day'),
      ('cv_download', NULL, '/', '$UA_HUMAN', '66.249.66.1', NOW() - interval '1 day');
    INSERT INTO contact_messages (name, email, message) VALUES ('A', 'a@x.com', 'hi'), ('B', 'b@x.com', 'yo');
    INSERT INTO guestbook_entries (name, message, flagged) VALUES ('A', 'nice', false), ('S', 'casino', true);
  `)
})

async function auth() {
  const { createToken, SESSION_COOKIE } = await import('@/lib/server/auth')
  return { Cookie: `${SESSION_COOKIE}=${createToken()}` }
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
    expect(data.stats.excludedBots).toBe(5)
    expect(data.dailyViews).toHaveLength(7)
    expect(data.referrers.map((r: any) => r.source).sort()).toEqual(['Direct', 'linkedin.com'])
  }, 30_000) // first import of the route

  it("counts real visitors' actions, listing every kind", async () => {
    const { GET } = await import('@/app/api/admin/analytics/route')
    const data = await (
      await GET(new Request('https://x/api/admin/analytics?days=7', { headers: await auth() }))
    ).json()
    const byName = Object.fromEntries(data.actions.map((a: any) => [a.name, a.count]))
    expect(byName).toEqual({ cv_download: 1, live_site: 2, contact_click: 0, message_link: 0 })
    expect(data.actions.find((a: any) => a.name === 'live_site').visitors).toBe(2)
    expect(data.liveSites).toEqual([{ target: 'rehlte', count: 2 }])
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

describe('admin session', () => {
  const login = async (password: string, ip: string) => {
    const { POST } = await import('@/app/api/admin/login/route')
    return POST(
      new Request('https://x/api/admin/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: JSON.stringify({ password }),
      }),
    )
  }

  it('signs in with an HttpOnly cookie and no token in the body', async () => {
    const res = await login('secret', '198.51.100.1')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    const cookie = res.headers.get('set-cookie')!
    expect(cookie).toMatch(/^admin_session=[\w-]+\.[0-9a-f]+;/)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Strict')
    expect(cookie).toContain('Path=/api/admin')

    // The cookie it set opens the admin API
    const { GET } = await import('@/app/api/admin/session/route')
    const session = cookie.split(';')[0]
    expect((await GET(new Request('https://x', { headers: { Cookie: session } }))).status).toBe(200)
    expect((await GET(new Request('https://x'))).status).toBe(401)
  })

  it('rejects a wrong password, then rate limits (counts kept in the database)', async () => {
    const statuses: number[] = []
    for (let i = 0; i < 4; i++) statuses.push((await login('wrong', '198.51.100.2')).status)
    expect(statuses).toEqual([401, 401, 401, 429])
    // Another client is unaffected
    expect((await login('wrong', '198.51.100.3')).status).toBe(401)
    const [row] = (
      await pg.query('SELECT count FROM rate_limits WHERE key LIKE $1', ['/api/admin/login:%'])
    ).rows as any[]
    expect(row).toBeTruthy()
  })

  it('log out clears the cookie', async () => {
    const { DELETE } = await import('@/app/api/admin/session/route')
    expect((await DELETE()).headers.get('set-cookie')).toContain('Max-Age=0')
  })

  it('blocks changes sent from another site', async () => {
    const m = await import('@/app/api/admin/messages/route')
    const res = await m.DELETE(
      new Request('https://x/api/admin/messages', {
        method: 'DELETE',
        headers: { ...(await auth()), Origin: 'https://evil.example' },
        body: JSON.stringify({ ids: [2] }),
      }),
    )
    expect(res.status).toBe(403)
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

describe('guestbook', () => {
  const sign = async (name: string, message: string, ip: string) => {
    const { POST } = await import('@/app/api/guestbook/route')
    return POST(
      new Request('https://x/api/guestbook', {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
        body: JSON.stringify({ name, message }),
      }),
    )
  }

  it('flags likely spam when it is saved', async () => {
    expect((await sign('Sara', 'Lovely site!', '198.51.100.20')).status).toBe(200)
    expect((await sign('Bot', 'Best casino bonus', '198.51.100.21')).status).toBe(200)
    const rows = (
      await pg.query(`SELECT name, flagged FROM guestbook_entries WHERE name IN ('Sara', 'Bot')`)
    ).rows as any[]
    expect(Object.fromEntries(rows.map((r) => [r.name, r.flagged]))).toEqual({
      Sara: false,
      Bot: true,
    })
  }, 30_000) // first import of the route loads nodemailer
})

describe('weekly summary', () => {
  it('summarizes real visitors and what is waiting', async () => {
    const { getWeeklySummary, formatWeeklySummary } = await import('@/lib/server/weeklySummary')
    const s = await getWeeklySummary()
    // Same human rows as the 7-day analytics test
    expect(s.views).toBe(4)
    expect(s.visitors).toBe(3)
    expect(s.prevViews).toBe(1)
    expect(s.sources.map((x) => x.label).sort()).toEqual(['Direct', 'linkedin.com'])
    expect(s.pendingGuestbook).toBe(1) // Sara; the casino entry is flagged
    const mail = formatWeeklySummary(s)
    expect(mail.subject).toBe('[Portfolio] Weekly summary: 3 visitors')
    expect(mail.text).toContain('Visitors: 3 (+200% vs last week)')
    // Only actions that happened, plus which live sites were opened
    expect(s.actions).toEqual([
      { label: 'Live site links', value: 2 },
      { label: 'CV downloads', value: 1 },
      { label: 'Live site: rehlte', value: 2 },
    ])
    expect(mail.text).toContain('Actions (clicks):')
  })

  it('only runs for the cron secret', async () => {
    const { GET } = await import('@/app/api/cron/weekly-summary/route')
    process.env.CRON_SECRET = 'cron'
    const call = (auth?: string) =>
      GET(new Request('https://x', { headers: auth ? { authorization: auth } : {} }))
    expect((await call()).status).toBe(401)
    expect((await call('Bearer nope')).status).toBe(401)
    // Right secret, but no SMTP configured in tests
    expect((await call('Bearer cron')).status).toBe(503)
  })
})

describe('track', () => {
  it('skips bots, cloud networks and admin paths, records humans', async () => {
    const { POST } = await import('@/app/api/track/route')
    const post = (path: string, ua: string, ip = '192.0.2.5') =>
      POST(
        new Request('https://x/api/track', {
          method: 'POST',
          headers: { 'user-agent': ua, 'x-forwarded-for': ip },
          body: JSON.stringify({ path, referrer: 'direct' }),
        }),
      )
    expect((await post('/', 'Googlebot/2.1')).status).toBe(204)
    expect((await post('/admin/login', UA_HUMAN)).status).toBe(204)
    expect((await post('/', UA_HUMAN)).status).toBe(200)
    // Cloud networks: Azure (e-mail link scanners) and AWS
    expect((await post('/', UA_HUMAN, '20.40.1.1')).status).toBe(204)
    expect((await post('/', UA_HUMAN, '3.80.0.1')).status).toBe(204)
  }, 30_000) // first import of the route loads the geo-IP database

  it('records known actions from real visitors', async () => {
    const { POST } = await import('@/app/api/track/route')
    const post = (body: object, ua = UA_HUMAN, ip = '192.0.2.6') =>
      POST(
        new Request('https://x/api/track', {
          method: 'POST',
          headers: { 'user-agent': ua, 'x-forwarded-for': ip },
          body: JSON.stringify(body),
        }),
      )
    expect((await post({ action: 'live_site', path: '/posts/kptc', target: 'kptc' })).status).toBe(
      200,
    )
    expect((await post({ action: 'made_up', path: '/' })).status).toBe(204)
    expect((await post({ action: 'cv_download', path: '/' }, 'Googlebot/2.1')).status).toBe(204)
    expect((await post({ action: 'cv_download', path: '/' }, UA_HUMAN, '20.40.1.1')).status).toBe(
      204,
    )
    const rows = (
      await pg.query(`SELECT name, target, path FROM actions WHERE ip_address = '192.0.2.6'`)
    ).rows
    expect(rows).toEqual([{ name: 'live_site', target: 'kptc', path: '/posts/kptc' }])
    // Not recorded as a page view
    expect(
      (await pg.query(`SELECT 1 FROM page_views WHERE ip_address = '192.0.2.6'`)).rows,
    ).toHaveLength(0)
  })
})

describe('owner visits', () => {
  it('signing in remembers the current address', async () => {
    const { GET } = await import('@/app/api/admin/session/route')
    await GET(
      new Request('https://x', {
        headers: { ...(await auth()), 'x-forwarded-for': '203.0.113.9' },
      }),
    )
    const rows = (await pg.query(`SELECT day FROM owner_ips WHERE ip = '203.0.113.9'`)).rows
    expect(rows).toHaveLength(1)
  })
})

describe('visit details', () => {
  it('reads the device, app, network and history of a visit', async () => {
    const FB =
      'Mozilla/5.0 (Linux; Android 13; SM-A225F Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/155.0.8059.76 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/583.0.0.39.55;IABMV/1;]'
    await pg.exec(`
      INSERT INTO page_views (path, referrer, user_agent, ip_address, country, device_type, timestamp) VALUES
        ('/', 'http://ahmad-ayman.vercel.app/', '${FB}', '197.53.47.104', 'EG', 'mobile', NOW() - interval '3 days'),
        ('/posts/kptc', 'internal', '${FB}', '197.53.47.104', 'EG', 'mobile', NOW() - interval '1 day');
    `)
    const [{ id }] = (
      await pg.query(`SELECT id FROM page_views WHERE ip_address = '197.53.47.104' AND path = '/'`)
    ).rows as any[]

    // The registry (RIPEstat), faked
    const fetchMock = vi.fn(async (url: string) =>
      Response.json({
        data: url.includes('network-info')
          ? { asns: ['8452'], prefix: '197.48.0.0/13' }
          : { holder: 'TE-AS - TE Data' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const { GET } = await import('@/app/api/admin/visit/route')
    const get = async () =>
      (
        await GET(new Request(`https://x/api/admin/visit?id=${id}`, { headers: await auth() }))
      ).json()

    const d = await get()
    expect(d.ip).toBe('197.53.47.104')
    expect(d.network).toEqual({ asn: '8452', holder: 'TE-AS - TE Data', prefix: '197.48.0.0/13' })
    expect(d.device).toEqual({ type: 'mobile', vendor: 'Samsung', model: 'SM-A225F' })
    expect(d.inApp).toBe('Facebook')
    expect(d.os).toBe('Android 13')
    expect(d.history).toMatchObject({ views: 2, days: 2 })
    expect(d.notes.join(' ')).toContain('Opened inside the Facebook app')
    expect(d.notes.join(' ')).toContain('Most likely a real person')

    // Looked up once, then read from the database
    await get()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    vi.unstubAllGlobals()
  })

  it('needs a session', async () => {
    const { GET } = await import('@/app/api/admin/visit/route')
    expect((await GET(new Request('https://x/api/admin/visit?id=1'))).status).toBe(401)
  })
})
