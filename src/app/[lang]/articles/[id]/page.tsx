// Syntax colours for code blocks in Markdown content
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import { getArticle, getArticleIds } from '@/lib/content/articles'
import { alternates, getDictionary, isLocale, ogLocale } from '@/i18n'
import ArticleClient from './article-client'

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams() {
  return getArticleIds().map((id) => ({ id }))
}

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateMetadata({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) return {}
  const data = await getArticle(id, lang)
  const title = `${data.title}${getDictionary(lang).meta.titleSuffix}`
  return {
    title,
    description: data.summary,
    openGraph: {
      title,
      description: data.summary,
      type: 'article',
      publishedTime: data.date,
      locale: ogLocale[lang],
    },
    alternates: alternates(lang, `/articles/${id}`),
    // Drafts are only served by the dev server, but never let them be indexed
    ...(data.draft ? { robots: { index: false } } : {}),
  }
}

export default async function ArticlePage({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) notFound()
  return <ArticleClient data={await getArticle(id, lang)} />
}
