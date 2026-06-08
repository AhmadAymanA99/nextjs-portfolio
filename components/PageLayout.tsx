'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BackToTop from './BackToTop'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'

const name = 'Ahmad Ayman'

export function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Image
          priority
          src="/images/profile.png"
          className={utilStyles.borderCircle}
          height={200}
          width={200}
          sizes="200px"
          alt={name}
        />
        <h1 className={utilStyles.heading2Xl}>{name}</h1>
      </header>
      <main id="main-content">{children}</main>
      <BackToTop />
    </div>
  )
}

export function DetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/">
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
          <Link href="/" className={utilStyles.colorInherit}>
            {name}
          </Link>
        </h2>
      </header>
      <div className={styles.backToHome}>
        <Link href="/">← Back to home</Link>
      </div>
      <main id="main-content">{children}</main>
      <BackToTop />
    </div>
  )
}
