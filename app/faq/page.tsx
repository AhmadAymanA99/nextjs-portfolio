import Accordion from '../../components/Accordion'
import { DetailLayout } from '../../components/PageLayout'
import { faqData } from '../../lib/faq'

export const metadata = {
  title: 'FAQ - Ahmad Ayman',
  description: 'Frequently asked questions about Ahmad Ayman\'s work, availability, and process.',
}

export default function FAQPage() {
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
          FAQ
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
          }}
        >
          Frequently asked questions
        </p>
        <Accordion
          items={faqData.map((f) => ({
            title: f.q,
            content: f.a,
          }))}
        />
      </section>
    </DetailLayout>
  )
}
