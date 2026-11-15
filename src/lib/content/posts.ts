import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import { extractHeadings, normalizeBullets } from './markdown'
import { postTags } from './tags'

export type Metric = { value: string; label: string }

/** Case-study fields shared by every project file (see content/posts). */
export type ProjectMeta = {
  title: string
  date: string
  summary: string
  company?: string
  role?: string
  platform?: string
  status?: string
  stack: string[]
  metrics: Metric[]
  link?: string
  screenshots: string[]
}

function readMeta(data: Record<string, unknown>): ProjectMeta {
  return {
    title: data.title as string,
    date: data.date as string,
    summary: (data.summary as string) ?? '',
    company: data.company as string | undefined,
    role: data.role as string | undefined,
    platform: data.platform as string | undefined,
    status: data.status as string | undefined,
    stack: (data.stack as string[]) ?? [],
    metrics: (data.metrics as Metric[]) ?? [],
    link: data.link as string | undefined,
    screenshots: (data.screenshots as string[]) ?? [],
  }
}

const postsDirectory = path.join(process.cwd(), 'content', 'posts')

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
      return {
        id,
        tags: postTags[id] || [],
        ...readMeta(matterResult.data),
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
  const meta = readMeta(matterResult.data)

  const wordCount = matterResult.content.split(/\s+/g).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const headings = extractHeadings(matterResult.content)

  const processedContent = normalizeBullets(matterResult.content)

  const contentHtml = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(processedContent)
    .then((r) => r.toString())

  return {
    id,
    contentHtml,
    readingTime,
    headings: headings.filter((h) => h.depth >= 2),
    ...meta,
    tags: postTags[id] || [],
    description: meta.summary,
  }
}
