'use client'

import dynamic from 'next/dynamic'
import Date from '../../../components/date'
import ShareButtons from '../../../components/ShareButtons'
import TableOfContents from '../../../components/TableOfContents'
import ViewCounter from '../../../components/ViewCounter'
import RelatedProjects from '../../../components/RelatedProjects'
import Footer from '../../../components/Footer'
import { DetailLayout } from '../../../components/PageLayout'
import useScrollReveal from '../../../lib/useScrollReveal'
import utilStyles from '../../../styles/utils.module.css'

const Lightbox = dynamic(() => import('../../../components/Lightbox'), { ssr: false })

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
            <Date dateString={postData.date} />
            {postData.readingTime && <span> · {postData.readingTime} min read</span>}
            <span> · </span>
            <ViewCounter path={`/posts/${postData.id}`} />
          </div>
          <div className="content-with-toc">
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
            />
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
