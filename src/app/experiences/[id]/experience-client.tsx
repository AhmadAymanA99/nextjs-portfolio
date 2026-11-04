'use client'

import FormattedDate from '@/components/ui/FormattedDate'
import Footer from '@/components/layout/Footer'
import ShareButtons from '@/components/detail/ShareButtons'
import TableOfContents from '@/components/detail/TableOfContents'
import ViewCounter from '@/components/detail/ViewCounter'
import { DetailLayout } from '@/components/layout/PageLayout'
import utilStyles from '@/styles/utils.module.css'

export default function ExperienceClient({ data }: { data: any }) {
  return (
    <>
      <DetailLayout>
        <article className="article">
          <h1 className={utilStyles.headingXl}>{data.title}</h1>
          <div className={utilStyles.lightText}>
            <FormattedDate dateString={data.date} /> to{' '}
            {data.till === 'now' ? <span>now</span> : <FormattedDate dateString={data.till} />}
            {data.readingTime && <span> · {data.readingTime} min read</span>}
            <span> · </span>
            <ViewCounter path={`/experiences/${data.id}`} />
          </div>
          <div className="content-with-toc">
            <div className="content" dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
            <TableOfContents headings={data.headings || []} />
          </div>
          <ShareButtons title={data.title} />
        </article>
      </DetailLayout>
      <Footer />
    </>
  )
}
