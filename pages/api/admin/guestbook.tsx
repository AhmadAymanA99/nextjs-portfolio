import { verifyToken } from '../../../lib/auth'
import { ensureDB } from '../../../lib/db'

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = auth.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  try {
    const sql = await ensureDB()

    if (req.method === 'GET') {
      const entries = await sql`
        SELECT id, name, message, website, approved, created_at
        FROM guestbook_entries
        ORDER BY created_at DESC
        LIMIT 200
      `
      return res.status(200).json({ entries })
    }

    if (req.method === 'PUT') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      await sql`
        UPDATE guestbook_entries SET approved = NOT approved WHERE id = ${id}
      `
      return res.status(200).json({ success: true })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body
      if (!id) return res.status(400).json({ error: 'id is required' })

      await sql`
        DELETE FROM guestbook_entries WHERE id = ${id}
      `
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Admin guestbook error:', err)
    res.status(500).json({ error: 'Failed to process request' })
  }
}
