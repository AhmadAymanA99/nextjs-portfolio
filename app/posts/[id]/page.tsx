import { getAllPostIds, getPostData, getSortedPostsData } from '../../../lib/posts'
import { postScreenshots } from '../../../lib/screenshots'
import PostClient from './post-client'

export const revalidate = 3600

export async function generateStaticParams() {
  return getAllPostIds().map((p: { params: { id: string } }) => ({ id: p.params.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postData = await getPostData(id)
  return {
    title: `${postData.title} - Ahmad Ayman`,
    description: postData.contentHtml?.replace(/<[^>]*>/g, '').slice(0, 160) || postData.title,
    openGraph: {
      title: `${postData.title} - Ahmad Ayman`,
      type: 'article',
    },
    other: {
      canonical: `https://ahmad-ayman.vercel.app/posts/${id}`,
    },
    alternates: {
      canonical: `https://ahmad-ayman.vercel.app/posts/${id}`,
    },
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postData = await getPostData(id)
  const allPosts = await getSortedPostsData()

  return (
    <PostClient
      postData={postData}
      allPosts={allPosts}
      screenshots={postScreenshots[postData.id] || []}
    />
  )
}
