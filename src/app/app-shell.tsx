'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import dynamic from 'next/dynamic'

import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import { isTrackingDisabled, trackPageView } from '@/lib/tracking'
import SmoothScroll from '@/components/layout/SmoothScroll'
import LanguageSwitch from '@/components/layout/LanguageSwitch'
import { useI18n } from '@/i18n/I18nProvider'
import { publicPath } from '@/i18n/config'

const ParticlesBackground = dynamic(() => import('@/components/layout/ParticlesBackground'), {
  ssr: false,
})

function ShellInner({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const { dict } = useI18n()
  // English pages are served from internal /en routes; record the public URL
  const pathname = publicPath(usePathname())

  const isFirstView = useRef(true)

  useEffect(() => {
    // document.referrer stays the same across client-side navigations, so only
    // the landing page gets the external referrer; later views are internal.
    const referrer = isFirstView.current ? document.referrer || 'direct' : 'internal'
    isFirstView.current = false
    if (process.env.NODE_ENV === 'production' && !isTrackingDisabled()) {
      trackPageView(pathname, referrer)
    }
    ;(window as any).__lenis?.scrollTo(0, { immediate: true })
  }, [pathname])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const isAdmin = pathname.startsWith('/admin')

  return (
    <div style={{ position: 'relative', zIndex: 1, overflowX: 'hidden' }}>
      <a href="#main-content" className="skip-link">
        {dict.common.skipToContent}
      </a>
      {!isAdmin && <LanguageSwitch />}
      {!isAdmin && <ParticlesBackground theme={theme} />}
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
