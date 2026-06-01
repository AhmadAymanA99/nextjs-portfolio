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

export const metadata = {
  title: 'Ahmad Ayman Portfolio',
  description:
    'Software Engineer specializing in React, Next.js, and full-stack development with experience in healthcare, education, and enterprise applications.',
  icons: { icon: '/favicon.svg?v=2' },
  manifest: '/manifest.json',
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
        <link rel="alternate icon" href="/favicon.ico?v=2" sizes="any" />
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.backgroundColor=t==='dark'?'#0d1117':'#ffffff';}catch(e){}})();`,
        }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
