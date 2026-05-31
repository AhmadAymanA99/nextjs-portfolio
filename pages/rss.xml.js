import { getSortedPostsData } from '../lib/posts'
import { getSortedExperiencesData } from '../lib/experience'

const siteUrl = 'https://ahmad-ayman.vercel.app'

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function getServerSideProps({ res }) {
  const posts = await getSortedPostsData()
  const experiences = await getSortedExperiencesData()
  const items = [...posts, ...experiences].sort((a, b) => (a.date < b.date ? 1 : -1))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ahmad Ayman - Portfolio</title>
    <link>${siteUrl}</link>
    <description>Software Engineer specializing in React, Next.js, and full-stack development</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items.map((item) => {
      const type = 'till' in item ? 'experiences' : 'posts'
      const link = `${siteUrl}/${type}/${item.id}`
      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${escapeXml(item.title)}</description>
    </item>`
    }).join('')}
  </channel>
</rss>`

  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
  res.write(xml)
  res.end()

  return { props: {} }
}

export default function RssFeed() {
  return null
}
