import type { MetadataRoute } from 'next'
import { getSortedPostsData } from '@/lib/content/posts'
import { getSortedExperiencesData } from '@/lib/content/experience'
import { siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (path: string, priority: number, changeFrequency: 'weekly' | 'monthly') => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
  })

  return [
    entry('', 1, 'weekly'),
    entry('/faq', 0.5, 'monthly'),
    entry('/guestbook', 0.5, 'weekly'),
    ...getSortedPostsData().map((p) => entry(`/posts/${p.id}`, 0.7, 'monthly')),
    ...getSortedExperiencesData().map((e) => entry(`/experiences/${e.id}`, 0.7, 'monthly')),
  ]
}
