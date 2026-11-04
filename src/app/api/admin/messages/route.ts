import { readIds, requireAdmin } from '@/lib/server/auth'
import { ensureDB } from '@/lib/server/db'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const sql = await ensureDB()

    const messages = await sql`
      SELECT id, name, email, subject, message, is_read, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 500
    `

    return Response.json({ messages })
  } catch (err) {
    console.error('Messages error:', err)
    return Response.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

/** Body: `{ ids, read: boolean }` */
export async function PATCH(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { ids, body } = await readIds(req)
  if (!ids.length || typeof body.read !== 'boolean') {
    return Response.json({ error: 'ids and read are required' }, { status: 400 })
  }

  try {
    const sql = await ensureDB()
    await sql`UPDATE contact_messages SET is_read = ${body.read} WHERE id = ANY(${ids})`
    return Response.json({ success: true })
  } catch (err) {
    console.error('Messages update error:', err)
    return Response.json({ error: 'Failed to update messages' }, { status: 500 })
  }
}

/** Body: `{ ids }` */
export async function DELETE(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { ids } = await readIds(req)
  if (!ids.length) return Response.json({ error: 'ids are required' }, { status: 400 })

  try {
    const sql = await ensureDB()
    await sql`DELETE FROM contact_messages WHERE id = ANY(${ids})`
    return Response.json({ success: true })
  } catch (err) {
    console.error('Messages delete error:', err)
    return Response.json({ error: 'Failed to delete messages' }, { status: 500 })
  }
}
