import { rssResponse } from '@/lib/rss'

/** The English feed (the Arabic one is at /ar/rss.xml) */
export function GET() {
  return rssResponse('en')
}
