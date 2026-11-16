/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pages sit under app/[lang] and admin has its own root layout, so a 404 for
  // URLs outside both needs app/global-not-found.tsx
  experimental: { globalNotFound: true },
  // Markdown content (both languages) is read at request time for revalidation
  outputFileTracingIncludes: { '/**': ['./content/**/*'] },
  // geoip-lite reads its data files relative to its own install path
  serverExternalPackages: ['geoip-lite'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'i.scdn.co' }],
  },
  // Removed projects: send old links and search results to the home page
  // Each rule also covers the Arabic URL (/ar/posts/…)
  redirects: async () =>
    ['', '/ar'].flatMap((prefix) => [
      ...['awn-app', 'covid-dashboard', 'would-you-rather', 'portfolio-website'].map((id) => ({
        source: `${prefix}/posts/${id}`,
        destination: prefix || '/',
        permanent: true,
      })),
      // Procoor PM and FM were merged into one case study
      ...['procoor-pm', 'procoor-fm'].map((id) => ({
        source: `${prefix}/posts/${id}`,
        destination: `${prefix}/posts/procoor`,
        permanent: true,
      })),
    ]),
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
}

export default nextConfig
