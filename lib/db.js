import { neon } from '@neondatabase/serverless';

let sql = null;

function getSql() {
  if (!sql) {
    sql = neon(process.env.POSTGRES_URL);
  }
  return sql;
}

const pageViewsDDL = `CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  country TEXT,
  device_type TEXT
)`
const contactMessagesDDL = `CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)`

let initPromise = null;

export async function ensureDB() {
  if (initPromise) {
    try { return await initPromise } catch { initPromise = null }
  }
  initPromise = (async () => {
    const db = getSql()
    await db(pageViewsDDL)
    await db(contactMessagesDDL)
    return db
  })()
  return await initPromise
}

export default function query(strings, ...values) {
  return getSql()(strings, ...values);
}
