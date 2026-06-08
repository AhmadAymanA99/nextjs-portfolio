'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import dynamic from 'next/dynamic'

import { ThemeProvider, useTheme } from '../lib/ThemeContext'
import SmoothScroll from '../components/SmoothScroll'

const ParticlesBackground = dynamic(
  () => import('../components/ParticlesBackground'),
  { ssr: false },
)

function ShellInner({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || 'direct',
      }),
    }).catch(() => {})
    ;(window as any).__lenis?.scrollTo(0, { immediate: true })
  }, [pathname])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <div style={{ position: 'relative', overflowX: 'hidden' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ParticlesBackground theme={theme} />
      <MotionConfig reducedMotion="user">
        <SmoothScroll>{children}</SmoothScroll>
      </MotionConfig>
    </div>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ShellInner>{children}</ShellInner>
    </ThemeProvider>
  )
}
