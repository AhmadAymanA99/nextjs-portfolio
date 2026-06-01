import { useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider, useTheme } from '../lib/ThemeContext'
import { geist } from '../lib/fonts'
import PageTransition from '../components/PageTransition'
import '../styles/global.css'
import 'highlight.js/styles/github-dark.css'

const ParticlesBackground = dynamic(() => import('../components/ParticlesBackground'), {
  ssr: false,
})

function AppContent({ Component, pageProps }) {
  const { theme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const track = (url) => {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: url,
          referrer: document.referrer || 'direct',
        }),
      }).catch((err) => console.error('Track error:', err))
    }

    track(router.asPath)

    router.events.on('routeChangeComplete', track)
    return () => router.events.off('routeChangeComplete', track)
  }, [router.events])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <div className={`App ${geist.variable}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <ParticlesBackground theme={theme} />
      <AnimatePresence mode="wait">
        <PageTransition key={router.route}>
          <Component {...pageProps} />
        </PageTransition>
      </AnimatePresence>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </ThemeProvider>
  )
}
