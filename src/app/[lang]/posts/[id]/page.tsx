// Syntax colours for code blocks in Markdown content
import 'highlight.js/styles/github-dark.css'
import { notFound } from 'next/navigation'
import { getAllPostIds, getPostData, getSortedPostsData } from '@/lib/content/posts'
import { alternates, getDictionary, isLocale, ogLocale } from '@/i18n'
import JsonLd from '@/components/seo/JsonLd'
import { projectJsonLd } from '@/lib/structuredData'
import { getCvUrl, ogImageUrl } from '@/lib/site'
import PostClient from './post-client'

export const revalidate = 3600
export const dynamicParams = false

export async function generateStaticParams() {
  return getAllPostIds().map((p) => ({ id: p.params.id }))
}

type Props = { params: Promise<{ lang: string; id: string }> }

export async function generateMetadata({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) return {}
  const postData = await getPostData(id, lang)
  const title = `${postData.title}${getDictionary(lang).meta.titleSuffix}`
  const description = postData.description || postData.title

  return {
    title,
    description,
    openGraph: {
      title,
      type: 'article',
      description,
      locale: ogLocale[lang],
      // The first screenshot, or the home card for a project without one
      images: [postData.screenshots[0] ?? ogImageUrl(lang)],
    },
    alternates: alternates(lang, `/posts/${id}`),
  }
}

export default async function PostPage({ params }: Props) {
  const { lang, id } = await params
  if (!isLocale(lang)) notFound()
  const postData = await getPostData(id, lang)
  const allPosts = getSortedPostsData(lang)

  return (
    <>
      <JsonLd data={projectJsonLd(lang, postData)} />
      <PostClient postData={postData} allPosts={allPosts} cvUrl={getCvUrl()} />
    </>
  )
}
