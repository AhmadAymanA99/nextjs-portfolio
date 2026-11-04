import { requireAdmin } from '@/lib/server/auth'
import { ensureDB } from '@/lib/server/db'

export async function GET(req: Request) {
  const denied = requireAdmin(req)
  if (denied) return denied

  try {
    const sql = await ensureDB()
    const entries = await sql`
      SELECT id, name, message, website, approved, created_at
      FROM guestbook_entries
      ORDER BY created_at DESC
      LIMIT 200
    `
    return Response.json({ entries })
  } catch (err) {
    console.error('Admin guestbook error:', err)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

async function withEntryId(req: Request, run: (id: number) => Promise<unknown>) {
  const denied = requireAdmin(req)
  if (denied) return denied

  const { id } = await req.json().catch(() => ({}))
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    await run(id)
    return Response.json({ success: true })
  } catch (err) {
    console.error('Admin guestbook error:', err)
    return Response.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export function PUT(req: Request) {
  return withEntryId(req, async (id) => {
    const sql = await ensureDB()
    await sql`UPDATE guestbook_entries SET approved = NOT approved WHERE id = ${id}`
  })
}

export function DELETE(req: Request) {
  return withEntryId(req, async (id) => {
    const sql = await ensureDB()
    await sql`DELETE FROM guestbook_entries WHERE id = ${id}`
  })
}
