import crypto from 'crypto'
import { sendToOwner } from '@/lib/server/mail'
import { formatWeeklySummary, getWeeklySummary } from '@/lib/server/weeklySummary'

/**
 * Emails the weekly traffic summary. Called by Vercel Cron (see vercel.json),
 * which sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  const expected = Buffer.from(`Bearer ${secret}`)
  const given = Buffer.from(req.headers.get('authorization') || '')
  if (!secret || given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const mail = formatWeeklySummary(await getWeeklySummary())
    const sent = await sendToOwner({ fromName: 'Portfolio', ...mail })
    return Response.json({ sent }, { status: sent ? 200 : 503 })
  } catch (err) {
    console.error('Weekly summary failed:', err)
    return Response.json({ error: 'Failed to build the summary' }, { status: 500 })
  }
}
