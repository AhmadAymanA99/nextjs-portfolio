import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import RootDocument from '../root-document'
import { getDictionary, isLocale, localePath, locales, ogLocale } from '@/i18n'
import { ogImageUrl, siteUrl } from '@/lib/site'
import { feedPath } from '@/lib/rss'

// Only /en (served at the unprefixed URLs) and /ar exist
export const dynamicParams = false

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

type Props = { params: Promise<{ lang: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!isLocale(lang)) return {}
  const { meta } = getDictionary(lang)
  const image = { url: ogImageUrl(lang), width: 1200, height: 630, alt: meta.title }

  return {
    metadataBase: new URL(siteUrl),
    title: meta.title,
    description: meta.description,
    // Pages set their own canonical and language alternates
    alternates: { types: { 'application/rss+xml': feedPath(lang) } },
    icons: { icon: '/favicon.svg?v=2' },
    manifest: '/manifest.json',
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${siteUrl}${localePath(lang, '/')}`,
      siteName: meta.siteName,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [image],
    },
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  }
}

export const viewport = {
  themeColor: '#0d1117',
}

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) notFound()
  return <RootDocument lang={lang}>{children}</RootDocument>
}
