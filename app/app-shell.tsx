'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
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
      <SmoothScroll>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      </SmoothScroll>
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
