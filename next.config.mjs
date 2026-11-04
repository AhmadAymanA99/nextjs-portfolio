/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // geoip-lite reads its data files relative to its own install path
  serverExternalPackages: ['geoip-lite'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: 'i.scdn.co' }],
  },
  // Removed projects: send old links and search results to the home page
  redirects: async () =>
    ['awn-app', 'covid-dashboard', 'would-you-rather', 'portfolio-website'].map((id) => ({
      source: `/posts/${id}`,
      destination: '/',
      permanent: true,
    })),
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
