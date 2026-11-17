import type { Locale } from '@/i18n/config'
import { listIds, readEntry, renderBody } from './markdown'

/**
 * Technical articles (content/articles). An article with `draft: true` can be
 * read with `npm run dev` but is left out of production builds, the home page,
 * the sitemap and the RSS feed.
 */
export type ArticleMeta = { title: string; date: string; summary: string; draft: boolean }

const showDrafts = process.env.NODE_ENV !== 'production'

function readArticle(id: string, lang: Locale) {
  const entry = readEntry('articles', id, lang)
  if (!entry) throw new Error(`Article not found: ${id}`)
  const meta: ArticleMeta = {
    title: entry.data.title as string,
    date: entry.data.date as string,
    summary: (entry.data.summary as string) ?? '',
    draft: entry.data.draft === true,
  }
  return { meta, content: entry.content }
}

export function getArticleIds() {
  return listIds('articles').filter((id) => showDrafts || !readArticle(id, 'en').meta.draft)
}

export function getSortedArticles(lang: Locale = 'en') {
  return getArticleIds()
    .map((id) => ({ id, ...readArticle(id, lang).meta }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export async function getArticle(id: string, lang: Locale = 'en') {
  const { meta, content } = readArticle(id, lang)
  return { id, ...meta, ...(await renderBody(content)) }
}
