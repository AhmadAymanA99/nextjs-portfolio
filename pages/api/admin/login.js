import { createToken } from '../../../lib/auth';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (password !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = createToken();
  res.status(200).json({ token });
}
