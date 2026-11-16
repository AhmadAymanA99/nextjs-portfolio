'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BackToTop from './BackToTop'
import styles from './PageLayout.module.css'
import utilStyles from '@/styles/utils.module.css'
import { useI18n } from '@/i18n/I18nProvider'

export function DetailLayout({ children }: { children: ReactNode }) {
  const { dict, href } = useI18n()
  const name = dict.common.name

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href={href('/')}>
          <Image
            priority
            src="/images/profile.png"
            className={utilStyles.borderCircle}
            height={100}
            width={100}
            sizes="100px"
            alt={name}
          />
        </Link>
        <h2 className={utilStyles.headingLg}>
          <Link href={href('/')} className={utilStyles.colorInherit}>
            {name}
          </Link>
        </h2>
      </header>
      <div className={styles.backToHome}>
        <Link href={href('/')}>{dict.common.backHome}</Link>
      </div>
      <main id="main-content">{children}</main>
      <BackToTop />
    </div>
  )
}
