'use client'

import { FaArrowUpRightFromSquare } from 'react-icons/fa6'
import type { Metric } from '@/lib/content/posts'
import styles from './ProjectHeader.module.css'
import { useI18n } from '@/i18n/I18nProvider'

type Props = {
  summary: string
  company?: string
  role?: string
  platform?: string
  status?: string
  stack: string[]
  metrics: Metric[]
  link?: string
}

/** The at-a-glance block at the top of a case study. */
export default function ProjectHeader({
  summary,
  company,
  role,
  platform,
  status,
  stack,
  metrics,
  link,
}: Props) {
  const { dict } = useI18n()
  const t = dict.project
  const facts = [
    [t.role, role],
    [t.company, company],
    [t.platform, platform],
    [t.status, status],
  ].filter((f): f is [string, string] => Boolean(f[1]))

  return (
    <section className={styles.header} aria-label={t.overview}>
      {summary && <p className={styles.summary}>{summary}</p>}

      {facts.length > 0 && (
        <dl className={styles.facts}>
          {facts.map(([label, value]) => (
            <div key={label} className={styles.fact}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {metrics.length > 0 && (
        <ul className={styles.metrics}>
          {metrics.map((m) => (
            <li key={m.label} className={styles.metric}>
              <span className={styles.metricValue} dir="ltr">
                {m.value}
              </span>
              <span className={styles.metricLabel}>{m.label}</span>
            </li>
          ))}
        </ul>
      )}

      {stack.length > 0 && (
        <ul className={styles.stack} aria-label={t.techStack}>
          {stack.map((s) => (
            <li key={s} className={styles.stackItem}>
              {s}
            </li>
          ))}
        </ul>
      )}

      {link && (
        <a className={styles.link} href={link} target="_blank" rel="noopener noreferrer">
          {t.visitLive} <FaArrowUpRightFromSquare aria-hidden="true" className="rtl-flip" />
        </a>
      )}
    </section>
  )
}
