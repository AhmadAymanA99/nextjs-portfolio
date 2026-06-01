import { ensureDB } from '../../lib/db'
import Guestbook from '../../components/Guestbook'
import { DetailLayout } from '../../components/PageLayout'

export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Guestbook - Ahmad Ayman',
  description: 'Leave a message for Ahmad Ayman.',
}

export default async function GuestbookPage() {
  let entries: { id: number; name: string; message: string; website: string; created_at: string }[] = []
  try {
    const sql = await ensureDB()
    const rows = await sql`
      SELECT id, name, message, website, created_at
      FROM guestbook_entries
      WHERE approved = true
      ORDER BY created_at DESC
      LIMIT 100
    `
    entries = rows as typeof entries
  } catch {}

  return (
    <DetailLayout>
      <Guestbook initialEntries={entries} />
    </DetailLayout>
  )
}
