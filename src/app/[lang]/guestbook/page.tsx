import { ensureDB } from '@/lib/server/db'
import Guestbook from '@/components/Guestbook'
import { DetailLayout } from '@/components/layout/PageLayout'
import { alternates, getDictionary, isLocale } from '@/i18n'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { guestbook, meta } = getDictionary(lang)
  const title = `${guestbook.metaTitle}${meta.titleSuffix}`
  return {
    title,
    description: guestbook.metaDescription,
    openGraph: { title, description: guestbook.metaDescription },
    alternates: alternates(lang, '/guestbook'),
  }
}

export default async function GuestbookPage() {
  let entries: {
    id: number
    name: string
    message: string
    website: string
    created_at: string
  }[] = []
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
