import { readIds, requireAdmin } from '@/lib/server/auth'
import { ensureDB } from '@/lib/server/db'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const sql = await ensureDB()
    const entries = await sql`
      SELECT id, name, message, website, approved, flagged, created_at
      FROM guestbook_entries
      ORDER BY approved ASC, created_at DESC
      LIMIT 500
    `
    return Response.json({ entries })
  } catch (err) {
    console.error('Admin guestbook error:', err)
    return Response.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

/** Body: `{ ids, approved: boolean }` */
export async function PATCH(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { ids, body } = await readIds(req)
  if (!ids.length || typeof body.approved !== 'boolean') {
    return Response.json({ error: 'ids and approved are required' }, { status: 400 })
  }

  try {
    const sql = await ensureDB()
    // Approving clears the spam flag: the admin has reviewed it.
    await sql`
      UPDATE guestbook_entries
      SET approved = ${body.approved}, flagged = CASE WHEN ${body.approved} THEN false ELSE flagged END
      WHERE id = ANY(${ids})
    `
    return Response.json({ success: true })
  } catch (err) {
    console.error('Admin guestbook update error:', err)
    return Response.json({ error: 'Failed to update entries' }, { status: 500 })
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
    await sql`DELETE FROM guestbook_entries WHERE id = ANY(${ids})`
    return Response.json({ success: true })
  } catch (err) {
    console.error('Admin guestbook delete error:', err)
    return Response.json({ error: 'Failed to delete entries' }, { status: 500 })
  }
}
