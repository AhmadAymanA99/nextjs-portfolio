import type { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { getSortedArticles } from '@/lib/content/articles'
import { localePath, locales } from '@/i18n'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: (readonly [
    path: string,
    priority: number,
    changeFrequency: 'weekly' | 'monthly',
  ])[] = [
    ['/', 1, 'weekly'],
    ['/faq', 0.5, 'monthly'],
    ['/guestbook', 0.5, 'weekly'],
    ['/games', 0.4, 'monthly'],
    ...getSortedPostsData().map((p) => [`/posts/${p.id}`, 0.7, 'monthly'] as const),
    ...getSortedExperiencesData().map((e) => [`/experiences/${e.id}`, 0.7, 'monthly'] as const),
    ...getSortedArticles()
      .filter((a) => !a.draft)
      .map((a) => [`/articles/${a.id}`, 0.7, 'monthly'] as const),
  ]

  const url = (lang: (typeof locales)[number], path: string) =>
    `${siteUrl}${localePath(lang, path)}`.replace(/\/$/, '')

  // One entry per language, each listing every language version (hreflang)
  return pages.flatMap(([path, priority, changeFrequency]) =>
    locales.map((lang) => ({
      url: url(lang, path),
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, url(l, path)])),
      },
    })),
  )
}
