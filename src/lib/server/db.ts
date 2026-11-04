import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (!sql) {
    const url = process.env.POSTGRES_URL
    if (!url) throw new Error('POSTGRES_URL not set')
    sql = neon(url)
  }
  return sql
}

let initPromise: Promise<NeonQueryFunction<false, false>> | null = null

export async function ensureDB() {
  if (initPromise) {
    try {
      return await initPromise
    } catch {
      initPromise = null
    }
  }
  initPromise = (async () => {
    const db = getSql()
    await db`CREATE TABLE IF NOT EXISTS page_views (
      id SERIAL PRIMARY KEY,
      path TEXT,
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW(),
      country TEXT,
      device_type TEXT
    )`
    await db`CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    await db`CREATE TABLE IF NOT EXISTS guestbook_entries (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      website TEXT DEFAULT '',
      approved BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`
    // Columns added after the tables first shipped
    await db`ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false`
    await db`ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT false`
    await db`CREATE INDEX IF NOT EXISTS page_views_timestamp_idx ON page_views (timestamp)`
    return db
  })()
  return await initPromise
}

export default function query(strings: TemplateStringsArray, ...values: unknown[]) {
  return getSql()(strings, ...values)
}
