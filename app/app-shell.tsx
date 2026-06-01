'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider, useTheme } from '../lib/ThemeContext'

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
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ParticlesBackground theme={theme} />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
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
