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

    const messages = await sql`
      SELECT id, name, email, subject, message, created_at
      FROM contact_messages
      ORDER BY created_at DESC
      LIMIT 100
    `

    res.status(200).json({ messages })
  } catch (err) {
    console.error('Messages error:', err)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
}
