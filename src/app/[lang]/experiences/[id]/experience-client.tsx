'use client'

import FormattedDate from '@/components/ui/FormattedDate'
import Footer from '@/components/layout/Footer'
import ShareButtons from '@/components/detail/ShareButtons'
import TableOfContents from '@/components/detail/TableOfContents'
import ViewCounter from '@/components/detail/ViewCounter'
import { DetailLayout } from '@/components/layout/PageLayout'
import utilStyles from '@/styles/utils.module.css'
import { useI18n } from '@/i18n/I18nProvider'
import { plural } from '@/i18n/config'

export default function ExperienceClient({ data }: { data: any }) {
  const { lang, dict } = useI18n()
  const [before, between, after] = dict.common.dateRange.split(/\{start\}|\{end\}/)

  return (
    <>
      <DetailLayout>
        <article className="article">
          <h1 className={utilStyles.headingXl}>{data.title}</h1>
          <div className={utilStyles.lightText}>
            {before}
            <FormattedDate lang={lang} dateString={data.date} />
            {between}
            <FormattedDate lang={lang} dateString={data.till} />
            {after}
            {data.readingTime && (
              <span> · {plural(lang, dict.common.readingTime, data.readingTime)}</span>
            )}
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
