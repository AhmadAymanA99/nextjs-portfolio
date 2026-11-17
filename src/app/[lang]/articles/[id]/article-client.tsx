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
import type { getArticle } from '@/lib/content/articles'

export default function ArticleClient({ data }: { data: Awaited<ReturnType<typeof getArticle>> }) {
  const { lang, dict } = useI18n()

  return (
    <>
      <DetailLayout>
        <article className="article">
          {data.draft && <p className={utilStyles.badge}>{dict.home.draft}</p>}
          <h1 className={utilStyles.headingXl}>{data.title}</h1>
          <div className={utilStyles.lightText}>
            <FormattedDate lang={lang} dateString={data.date} />
            <span> · {plural(lang, dict.common.readingTime, data.readingTime)}</span>
            <span> · </span>
            <ViewCounter path={`/articles/${data.id}`} />
          </div>
          <div className="content-with-toc">
            <div className="content" dangerouslySetInnerHTML={{ __html: data.contentHtml }} />
            <TableOfContents headings={data.headings} />
          </div>
          <ShareButtons title={data.title} />
        </article>
      </DetailLayout>
      <Footer />
    </>
  )
}
