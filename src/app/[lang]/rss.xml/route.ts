import { rssResponse } from '@/lib/rss'

/** The Arabic feed, /ar/rss.xml. English has /rss.xml (app/rss.xml). */
export const dynamicParams = false

export function generateStaticParams() {
  return [{ lang: 'ar' }]
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  await params
  return rssResponse('ar')
}
