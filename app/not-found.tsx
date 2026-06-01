import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" style={{ color: 'var(--text-link)', textDecoration: 'underline' }}>
        Go back home
      </Link>
    </div>
  )
}
