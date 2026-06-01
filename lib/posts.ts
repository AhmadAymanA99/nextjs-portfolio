import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import { postTags } from './tags'

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function extractHeadings(md: string) {
  const headingRe = /^(#{2,3})\s+(.+)$/gm
  const headings: { depth: number; text: string; id: string }[] = []
  let match: RegExpExecArray | null
  while ((match = headingRe.exec(md)) !== null) {
    headings.push({
      depth: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2].trim()),
    })
  }
  return headings
}

let componentCounter = 0

function processCustomComponents(md: string): string {
  componentCounter = 0

  let result = md

  result = result.replace(
    /<Callout\s+type="(info|warning|tip|success)"[^>]*>([\s\S]*?)<\/Callout>/g,
    (_, type, content) => {
      const icons = {
        info: '\u2139\uFE0F',
        warning: '\u26A0\uFE0F',
        tip: '\uD83D\uDCA1',
        success: '\u2705',
      }
      const colors = { info: '#1a66ff', warning: '#ffaa00', tip: '#00aa55', success: '#00cc66' }
      return `<div style="padding:0.75rem 1rem;margin:1rem 0;border-radius:8px;border-left:4px solid ${colors[type as keyof typeof colors]};background:${colors[type as keyof typeof colors]}15;font-size:0.95rem;line-height:1.6"><span style="margin-right:8px;font-size:1.1rem">${icons[type as keyof typeof icons]}</span>${content.trim()}</div>`
    },
  )

  result = result.replace(
    /<TechBadge\s+name="([^"]*)"\s*\/?>/g,
    (_, name) =>
      `<span style="display:inline-block;padding:0.2em 0.65em;margin:0.2em 0.15em;font-size:0.8rem;font-weight:600;border-radius:20px;background:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border-color)">${name}</span>`,
  )

  result = result.replace(
    /<MetricsCard\s+value="([^"]*)"\s+label="([^"]*)"\s*\/?>/g,
    (_, value, label) => {
      const id = `mc-${++componentCounter}`
      return `<div id="${id}" style="display:inline-flex;flex-direction:column;align-items:center;padding:1rem 1.5rem;margin:0.5rem;border-radius:12px;background:var(--bg-card);border:1px solid var(--border-color);min-width:120px"><span style="font-size:1.5rem;font-weight:700;color:var(--text-primary)">${value}</span><span style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">${label}</span></div>`
    },
  )

  result = result.replace(
    /<ImageGrid\s+images=\{(\[[^\]]*\])\}(?:\s+alt="([^"]*)")?\s*\/?>/g,
    (_, imagesStr, alt) => {
      const images: string[] = JSON.parse(imagesStr.replace(/'/g, '"'))
      const cols = Math.min(images.length, 3)
      const items = images
        .map(
          (src, i) =>
            `<img src="${src}" alt="${alt ? `${alt} ${i + 1}` : `Image ${i + 1}`}" style="width:100%;height:auto;border-radius:8px;border:1px solid var(--border-color)" loading="lazy" />`,
        )
        .join('')
      return `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px;margin:1rem 0">${items}</div>`
    },
  )

  result = result.replace(
    /<VideoEmbed\s+src="([^"]*)"(?:\s+title="([^"]*)")?\s*\/?>/g,
    (_, src, title) =>
      `<div style="position:relative;width:100%;padding-bottom:56.25%;margin:1rem 0;border-radius:8px;overflow:hidden"><iframe src="${src}" title="${title || 'Embedded video'}" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen style="position:absolute;inset:0;width:100%;height:100%;border:none" /></div>`,
  )

  return result
}

const postsDirectory = path.join(process.cwd(), 'posts')

function stripExt(name: string) {
  return name.replace(/\.mdx?$/, '')
}

export function getSortedPostsData() {
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((f) => /\.mdx?$/.test(f))
    .map((fileName) => {
      const id = stripExt(fileName)
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const matterResult = matter(fileContents)
      const data = matterResult.data as Record<string, unknown>
      return {
        id,
        tags: postTags[id] || [],
        ...data,
        date: data.date as string,
      }
    })
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) return 1
    return -1
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames
    .filter((f) => /\.mdx?$/.test(f))
    .map((fileName) => ({
      params: {
        id: stripExt(fileName),
      },
    }))
}

export async function getPostData(id: string) {
  const files = fs.readdirSync(postsDirectory)
  const file = files.find((f) => stripExt(f) === id && /\.mdx?$/.test(f))
  if (!file) throw new Error(`Post not found: ${id}`)
  const fullPath = path.join(postsDirectory, file)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents)
  const data = matterResult.data as Record<string, unknown>

  const wordCount = matterResult.content.split(/\s+/g).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const headings = extractHeadings(matterResult.content)

  const processedContent = processCustomComponents(matterResult.content)

  const contentHtml = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(processedContent)
    .then((r) => r.toString())

  const description = matterResult.content
    .replace(/#{1,6}\s+/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[•\-*]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)

  return {
    id,
    contentHtml,
    readingTime,
    headings: headings.filter((h) => h.depth >= 2),
    title: data.title as string,
    date: data.date as string,
    tags: (data.tags as string[]) || [],
    description,
  }
}
