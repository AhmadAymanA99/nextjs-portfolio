import { ensureDB } from '@/lib/server/db'

export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path')

  if (!path) {
    return Response.json({ error: 'path is required' }, { status: 400 })
  }

  try {
    const sql = await ensureDB()

    const result = await sql`
      SELECT COUNT(*) as count FROM page_views WHERE path = ${path}
    `

    return Response.json({ count: Number(result[0].count) })
  } catch (err) {
    console.error('Views error:', err)
    return Response.json({ error: 'Failed to get views' }, { status: 500 })
  }
}
