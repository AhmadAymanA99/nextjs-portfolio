'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import dynamic from 'next/dynamic'

import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import { isTrackingDisabled } from '@/lib/tracking'
import SmoothScroll from '@/components/layout/SmoothScroll'

const ParticlesBackground = dynamic(() => import('@/components/layout/ParticlesBackground'), {
  ssr: false,
})

function ShellInner({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const pathname = usePathname()

  const isFirstView = useRef(true)

  useEffect(() => {
    // document.referrer stays the same across client-side navigations, so only
    // the landing page gets the external referrer; later views are internal.
    const referrer = isFirstView.current ? document.referrer || 'direct' : 'internal'
    isFirstView.current = false
    if (process.env.NODE_ENV === 'production' && !isTrackingDisabled()) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pathname, referrer }),
      }).catch(() => {})
    }
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
