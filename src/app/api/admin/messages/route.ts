import { requireAdmin } from '@/lib/server/auth'
import { ensureDB } from '@/lib/server/db'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const sql = await ensureDB()

    const messages = await sql`
      SELECT id, name, email, subject, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 100
    `

    return Response.json({ messages })
  } catch (err) {
    console.error('Messages error:', err)
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}
