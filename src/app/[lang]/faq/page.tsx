import Accordion from '@/components/ui/Accordion'
import { DetailLayout } from '@/components/layout/PageLayout'
import { alternates, getDictionary, isLocale } from '@/i18n'

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { faq, meta } = getDictionary(lang)
  const title = `${faq.metaTitle}${meta.titleSuffix}`
  return {
    title,
    description: faq.metaDescription,
    openGraph: { title, description: faq.metaDescription },
    alternates: alternates(lang, '/faq'),
  }
}

export default async function FAQPage({ params }: Props) {
  const { lang } = await params
  if (!isLocale(lang)) return null
  const { faq } = getDictionary(lang)

  return (
    <DetailLayout>
      <section style={{ margin: '2rem 0' }}>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '0.35rem',
            color: 'var(--text-primary)',
          }}
        >
          {faq.title}
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}
        >
          {faq.subtitle}
        </p>
        <Accordion items={faq.items.map((f) => ({ title: f.q, content: f.a }))} />
      </section>
    </DetailLayout>
  )
}
