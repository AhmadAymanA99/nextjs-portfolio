'use client'

import Date from '../../../components/date'
import Footer from '../../../components/Footer'
import ShareButtons from '../../../components/ShareButtons'
import TableOfContents from '../../../components/TableOfContents'
import ViewCounter from '../../../components/ViewCounter'
import { DetailLayout } from '../../../components/PageLayout'
import utilStyles from '../../../styles/utils.module.css'

export default function ExperienceClient({ data }: { data: any }) {
  return (
    <>
      <DetailLayout>
        <article className="article">
          <h1 className={utilStyles.headingXl}>{data.title}</h1>
          <div className={utilStyles.lightText}>
            <Date dateString={data.date} /> to{' '}
            {data.till === 'now' ? <span>now</span> : <Date dateString={data.till} />}
            {data.readingTime && <span> · {data.readingTime} min read</span>}
            <span> · </span>
            <ViewCounter path={`/experiences/${data.id}`} />
          </div>
          <div className="content-with-toc">
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: data.contentHtml }}
            />
            <TableOfContents headings={data.headings || []} />
          </div>
          <ShareButtons title={data.title} />
        </article>
      </DetailLayout>
      <Footer />
    </>
  )
}
