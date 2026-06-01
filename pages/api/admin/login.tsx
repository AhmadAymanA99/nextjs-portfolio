import { createToken } from '../../../lib/auth'
import rateLimit from '../../../lib/rateLimit'

const limiter = rateLimit({ windowMs: 30000, max: 3 })

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!limiter(req, res)) return

  const { password } = req.body

  if (password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = createToken()
  res.status(200).json({ token })
}
