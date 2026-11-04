import type { ReactNode } from 'react'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import '../styles/global.css'
import 'highlight.js/styles/github-dark.css'
import AppShell from './app-shell'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const siteUrl = 'https://ahmad-ayman.vercel.app'

export const metadata = {
  title: 'Ahmad Ayman — Frontend & Mobile Engineer',
  description:
    'Frontend and mobile engineer with 6 years of experience building React, Next.js, React Native, and TypeScript apps for travel, healthcare, e-commerce, and government platforms across the MENA region.',
  icons: { icon: '/favicon.svg?v=2' },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Ahmad Ayman — Frontend & Mobile Engineer',
    description:
      'Frontend and mobile engineer with 6 years of experience building React, Next.js, React Native, and TypeScript apps for travel, healthcare, e-commerce, and government platforms across the MENA region.',
    url: siteUrl,
    siteName: 'Ahmad Ayman',
    locale: 'en_US',
    type: 'website',
    images: [{ url: `${siteUrl}/images/og-card.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ahmad Ayman — Frontend & Mobile Engineer',
    description:
      'Frontend and mobile engineer with 6 years of experience building React, Next.js, React Native, and TypeScript apps for travel, healthcare, e-commerce, and government platforms across the MENA region.',
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
