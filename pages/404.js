import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'

import utilStyles from '../styles/utils.module.css'

export default function Custom404() {
  return (
    <>
      <Layout>
        <Head>
          <title>404 - Page Not Found</title>
        </Head>
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h1 className={utilStyles.heading2Xl} style={{ fontSize: '5rem', margin: '0', lineHeight: 1 }}>
            404
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
            Page not found
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
            <Link href="/" style={{ color: 'var(--text-link)', fontSize: '1.1rem' }}>
              ← Back to home
            </Link>
            <Link href="/admin/login" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Admin
            </Link>
          </div>
        </div>
      </Layout>
    </>
  )
}
