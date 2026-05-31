import { neon } from '@neondatabase/serverless';

let sql = null;
let initPromise = null;

function getSql() {
  if (!sql) {
    sql = neon(process.env.POSTGRES_URL);
  }
  return sql;
}

export function ensureDB() {
  if (!initPromise) {
    initPromise = getSql()`
      CREATE TABLE IF NOT EXISTS page_views (
        id SERIAL PRIMARY KEY,
        path TEXT,
        referrer TEXT,
        user_agent TEXT,
        ip_address TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        country TEXT,
        device_type TEXT
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT DEFAULT '',
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
  }
  return initPromise;
}

export default function query(strings, ...values) {
  return getSql()(strings, ...values);
}
