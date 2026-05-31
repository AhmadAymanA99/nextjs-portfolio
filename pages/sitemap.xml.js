import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://ahmad-ayman.vercel.app'

function getSlugs(dir) {
  try {
    return fs.readdirSync(dir).map((f) => f.replace(/\.md$/, ''))
  } catch {
    return []
  }
}

export async function getServerSideProps({ res }) {
  const postsDir = path.join(process.cwd(), 'posts')
  const expDir = path.join(process.cwd(), 'Experience')

  const postSlugs = getSlugs(postsDir)
  const expSlugs = getSlugs(expDir)

  const staticPages = [
    { loc: '', priority: '1.0', changefreq: 'weekly' },
  ]

  const postPages = postSlugs.map((slug) => ({
    loc: `/posts/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }))

  const expPages = expSlugs.map((slug) => ({
    loc: `/experiences/${slug}`,
    priority: '0.7',
    changefreq: 'monthly',
  }))

  const allPages = [...staticPages, ...postPages, ...expPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map((p) => `  <url>
    <loc>${BASE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'text/xml')
  res.write(sitemap)
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}