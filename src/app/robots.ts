import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      // Link preview images live under /api; LinkedIn's and X's crawlers obey
      // robots.txt, so they must be allowed (the longer rule wins)
      allow: ['/', '/api/og'],
      disallow: ['/admin', '/api'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
