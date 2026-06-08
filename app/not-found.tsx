import Link from 'next/link'
import styles from '../styles/NotFound.module.css'

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>Page not found</p>
      <p className={styles.sub}>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link href="/" className={styles.link}>Go back home</Link>
    </div>
  )
}
