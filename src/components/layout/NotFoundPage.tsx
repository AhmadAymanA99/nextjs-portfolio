'use client'

import Link from 'next/link'
import { useI18n } from '@/i18n/I18nProvider'
import styles from './NotFoundPage.module.css'

/** The 404 page, in the current language */
export default function NotFoundPage() {
  const { dict, href } = useI18n()

  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>{dict.notFound.title}</p>
      <p className={styles.sub}>{dict.notFound.text}</p>
      <Link href={href('/')} className={styles.link}>
        {dict.notFound.home}
      </Link>
    </div>
  )
}
