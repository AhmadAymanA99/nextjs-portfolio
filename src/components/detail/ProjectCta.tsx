'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/I18nProvider'
import styles from './ProjectCta.module.css'

/**
 * End-of-case-study prompt: the next step for a visitor who read this far.
 * Clicks are counted as actions (data-track, see lib/tracking.ts).
 */
export default function ProjectCta({ cvUrl }: { cvUrl: string }) {
  const { dict, href } = useI18n()
  const t = dict.project

  return (
    <aside className={styles.cta} aria-labelledby="project-cta-title">
      <div className={styles.text}>
        <h2 id="project-cta-title" className={styles.title}>
          {t.ctaTitle}
        </h2>
        <p className={styles.body}>{t.ctaBody}</p>
      </div>
      <div className={styles.actions}>
        <Link href={`${href('/')}#contact`} className={styles.primary} data-track="contact_click">
          {t.ctaButton}
        </Link>
        <a href={cvUrl} className={styles.secondary} download data-track="cv_download">
          <span aria-hidden="true">↓</span> {dict.home.downloadCv}
        </a>
      </div>
    </aside>
  )
}
