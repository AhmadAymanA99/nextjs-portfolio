import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import '@/styles/global.css'
import 'highlight.js/styles/github-dark.css'
import AppShell from './app-shell'
import { siteDescription, siteName, siteUrl } from '@/lib/site'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const title = 'Ahmad Ayman — Frontend & Mobile Engineer'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { types: { 'application/rss+xml': '/rss.xml' } },
  title,
  description: siteDescription,
  icons: { icon: '/favicon.svg?v=2' },
  manifest: '/manifest.json',
  openGraph: {
    title,
    description: siteDescription,
    url: siteUrl,
    siteName,
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${siteUrl}/images/og-card.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: siteDescription,
    images: [`${siteUrl}/images/og-card.png`],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export const viewport = {
  themeColor: '#0d1117',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.backgroundColor=t==='dark'?'#0d1117':'#ffffff';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
