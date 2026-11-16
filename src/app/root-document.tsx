import type { ReactNode } from 'react'
import { Geist, IBM_Plex_Sans_Arabic } from 'next/font/google'
import Script from 'next/script'
import '@/styles/global.css'
import AppShell from './app-shell'
import { I18nProvider } from '@/i18n/I18nProvider'
import { dirOf, type Locale } from '@/i18n'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

// Arabic glyphs only. Not preloaded: most visitors read the English pages, and
// the browser only downloads it when a page contains Arabic text.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
  preload: false,
})

const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);document.documentElement.style.backgroundColor=t==='dark'?'#0d1117':'#ffffff';}catch(e){}})();`

/** The <html> document shared by the site's root layouts (public pages and admin). */
export default function RootDocument({ lang, children }: { lang: Locale; children: ReactNode }) {
  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      className={`${geist.variable} ${plexArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
      </head>
      <body>
        <I18nProvider lang={lang}>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  )
}
