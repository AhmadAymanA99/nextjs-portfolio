'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import { isTrackingDisabled, reportOwnerVisit, trackActions, trackPageView } from '@/lib/tracking'
import SmoothScroll from '@/components/layout/SmoothScroll'
import LanguageSwitch from '@/components/layout/LanguageSwitch'
import ThemeSwitch from '@/components/layout/ThemeSwitch'
import switchStyles from '@/components/layout/LanguageSwitch.module.css'
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
    if (process.env.NODE_ENV === 'production') {
      if (isTrackingDisabled()) reportOwnerVisit()
      else trackPageView(pathname, referrer)
    }
    // A link to a section (/#contact) scrolls there itself (see ContactForm)
    if (!window.location.hash) (window as any).__lenis?.scrollTo(0, { immediate: true })
  }, [pathname])

  // CV downloads, contact clicks, live-site links (data-track on the link)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    return trackActions(() => publicPath(window.location.pathname))
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const isAdmin = pathname.startsWith('/admin')

  return (
    // flow-root keeps the page's top margin inside this box (so the absolutely
    // positioned theme and language switches stays at the top); overflow clip, not hidden,
    // so scroll-driven animations follow the page scroll
    <div style={{ position: 'relative', zIndex: 1, overflowX: 'clip', display: 'flow-root' }}>
      <a href="#main-content" className="skip-link">
        {dict.common.skipToContent}
      </a>
      {!isAdmin && (
        <div className={switchStyles.controls}>
          <ThemeSwitch />
          <LanguageSwitch />
        </div>
      )}
      {!isAdmin && <ParticlesBackground theme={theme} />}
      <SmoothScroll>{children}</SmoothScroll>
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
