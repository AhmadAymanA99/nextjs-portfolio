import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { getSortedArticles } from '@/lib/content/articles'
import { getDictionary, localePath, type Locale } from '@/i18n'
import { siteUrl } from '@/lib/site'

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Where each language's feed lives: /rss.xml and /ar/rss.xml */
export const feedPath = (lang: Locale) => (lang === 'en' ? '/rss.xml' : `/${lang}/rss.xml`)

/** The RSS feed for one language: articles, case studies and jobs, newest first. */
export function rssResponse(lang: Locale) {
  const { meta } = getDictionary(lang)
  const posts = getSortedPostsData(lang).map((p) => ({ ...p, type: 'posts' }))
  const experiences = getSortedExperiencesData(lang).map((e) => ({ ...e, type: 'experiences' }))
  const articles = getSortedArticles(lang)
    .filter((a) => !a.draft)
    .map((a) => ({ ...a, type: 'articles' }))
  const items = [...articles, ...posts, ...experiences].sort((a, b) => (a.date < b.date ? 1 : -1))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${siteUrl}${localePath(lang, '/')}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}${feedPath(lang)}" rel="self" type="application/rss+xml"/>
    ${items
      .map((item) => {
        const link = `${siteUrl}${localePath(lang, `/${item.type}/${item.id}`)}`
        const title = String((item as { title?: string }).title ?? item.id)
        const summary = (item as { summary?: string }).summary || title
        return `
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(summary)}</description>
    </item>`
      })
      .join('')}
  </channel>
</rss>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
