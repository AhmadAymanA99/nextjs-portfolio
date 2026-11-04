'use client'

import dynamic from 'next/dynamic'
import FormattedDate from '@/components/ui/FormattedDate'
import ShareButtons from '@/components/detail/ShareButtons'
import TableOfContents from '@/components/detail/TableOfContents'
import ViewCounter from '@/components/detail/ViewCounter'
import RelatedProjects from '@/components/detail/RelatedProjects'
import Footer from '@/components/layout/Footer'
import { DetailLayout } from '@/components/layout/PageLayout'
import useScrollReveal from '@/lib/useScrollReveal'
import utilStyles from '@/styles/utils.module.css'

const Lightbox = dynamic(() => import('@/components/detail/Lightbox'), { ssr: false })

export default function PostClient({
  postData,
  allPosts,
  screenshots,
}: {
  postData: any
  allPosts: any[]
  screenshots: string[]
}) {
  const articleRef = useScrollReveal()

  return (
    <>
      <DetailLayout>
        <article className="article" ref={articleRef}>
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <FormattedDate dateString={postData.date} />
            {postData.readingTime && <span> · {postData.readingTime} min read</span>}
            <span> · </span>
            <ViewCounter path={`/posts/${postData.id}`} />
          </div>
          <div className="content-with-toc">
            <div className="content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            <TableOfContents headings={postData.headings || []} />
          </div>
          <Lightbox images={screenshots} postId={postData.id} />
          <ShareButtons title={postData.title} />
          <RelatedProjects currentId={postData.id} tags={postData.tags} allPosts={allPosts} />
        </article>
      </DetailLayout>
      <Footer />
    </>
  )
}
