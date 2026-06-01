import { ensureDB } from '../../lib/db'

export default async function handler(req, res) {
  const { path } = req.query

  if (!path) {
    return res.status(400).json({ error: 'path is required' })
  }

  try {
    const sql = await ensureDB()

    const result = await sql`
      SELECT COUNT(*) as count FROM page_views WHERE path = ${path}
    `

    res.status(200).json({ count: Number(result[0].count) })
  } catch (err) {
    console.error('Views error:', err)
    res.status(500).json({ error: 'Failed to get views' })
  }
}
