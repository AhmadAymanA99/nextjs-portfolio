import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { siteDescription, siteUrl } from '@/lib/site'

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function GET() {
  const posts = getSortedPostsData().map((p) => ({ ...p, type: 'posts' }))
  const experiences = getSortedExperiencesData().map((e) => ({ ...e, type: 'experiences' }))
  const items = [...posts, ...experiences].sort((a, b) => (a.date < b.date ? 1 : -1))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ahmad Ayman - Portfolio</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items
      .map((item) => {
        const link = `${siteUrl}/${item.type}/${item.id}`
        const title = String((item as { title?: string }).title ?? item.id)
        return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(title)}</description>
    </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
