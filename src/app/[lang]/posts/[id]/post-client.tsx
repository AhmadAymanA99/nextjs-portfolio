'use client'

import dynamic from 'next/dynamic'
import FormattedDate from '@/components/ui/FormattedDate'
import ShareButtons from '@/components/detail/ShareButtons'
import TableOfContents from '@/components/detail/TableOfContents'
import ViewCounter from '@/components/detail/ViewCounter'
import RelatedProjects from '@/components/detail/RelatedProjects'
import ProjectHeader from '@/components/detail/ProjectHeader'
import ProjectCta from '@/components/detail/ProjectCta'
import Footer from '@/components/layout/Footer'
import { DetailLayout } from '@/components/layout/PageLayout'
import utilStyles from '@/styles/utils.module.css'
import { useI18n } from '@/i18n/I18nProvider'
import { plural } from '@/i18n/config'

const Lightbox = dynamic(() => import('@/components/detail/Lightbox'), { ssr: false })

export default function PostClient({
  postData,
  allPosts,
  cvUrl,
}: {
  postData: any
  allPosts: any[]
  cvUrl: string
}) {
  const { lang, dict } = useI18n()

  return (
    <>
      <DetailLayout>
        <article className="article">
          <h1 className={utilStyles.headingXl}>{postData.title}</h1>
          <div className={utilStyles.lightText}>
            <FormattedDate lang={lang} dateString={postData.date} />
            {postData.readingTime && (
              <span> · {plural(lang, dict.common.readingTime, postData.readingTime)}</span>
            )}
            <span> · </span>
            <ViewCounter path={`/posts/${postData.id}`} />
          </div>
          <ProjectHeader {...postData} />
          <Lightbox images={postData.screenshots} title={postData.title} />
          <div className="content-with-toc">
            <div className="content" dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
            <TableOfContents headings={postData.headings || []} />
          </div>
          <ProjectCta cvUrl={cvUrl} />
          <ShareButtons title={postData.title} />
          <RelatedProjects currentId={postData.id} tags={postData.tags} allPosts={allPosts} />
        </article>
      </DetailLayout>
      <Footer />
    </>
  )
}
