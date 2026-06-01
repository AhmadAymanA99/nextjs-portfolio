'use client'

import Accordion from './Accordion'
import { faqData } from '../lib/faq'

export default function FAQSection() {
  return (
    <section style={{ margin: '2rem 0' }}>
      <h2
        style={{
          fontSize: '1.3rem',
          fontWeight: 700,
          marginBottom: '0.35rem',
          color: 'var(--text-primary)',
        }}
      >
        FAQ
      </h2>
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: '1.25rem',
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
  )
}
