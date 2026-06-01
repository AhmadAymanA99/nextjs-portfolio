import { ensureDB } from '../../lib/db'
import rateLimit from '../../lib/rateLimit'
import { verifyTurnstileToken } from '../../lib/turnstile'

const limiter = rateLimit({ windowMs: 60000, max: 10 })

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sql = await ensureDB()
      const entries = await sql`
        SELECT id, name, message, website, created_at
        FROM guestbook_entries
        WHERE approved = true
        ORDER BY created_at DESC
        LIMIT 100
      `
      return res.status(200).json({ entries })
    } catch (err) {
      console.error('Guestbook GET error:', err)
      return res.status(500).json({ error: 'Failed to fetch entries' })
    }
  }

  if (req.method === 'POST') {
    if (!limiter(req, res)) return

    const { name, message, website, turnstileToken } = req.body

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    if (turnstileToken) {
      const valid = await verifyTurnstileToken(turnstileToken)
      if (!valid) {
        return res.status(400).json({ error: 'Security check failed. Please try again.' })
      }
    }

    const trimmedName = name.trim().slice(0, 100)
    const trimmedMessage = message.trim().slice(0, 2000)
    const trimmedWebsite = (website || '').trim().slice(0, 500)

    if (!trimmedName || !trimmedMessage) {
      return res.status(400).json({ error: 'Name and message are required' })
    }

    try {
      const sql = await ensureDB()
      await sql`
        INSERT INTO guestbook_entries (name, message, website, approved, created_at)
        VALUES (${trimmedName}, ${trimmedMessage}, ${trimmedWebsite}, false, NOW())
      `
      res.status(200).json({ success: true })
    } catch (err) {
      console.error('Guestbook POST error:', err)
      res.status(500).json({ error: 'Failed to save entry' })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
