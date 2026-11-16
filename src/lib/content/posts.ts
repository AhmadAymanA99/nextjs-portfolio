import type { Locale } from '@/i18n/config'
import { listIds, readEntry, renderBody } from './markdown'
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

function readPost(id: string, lang: Locale) {
  const entry = readEntry('posts', id, lang)
  if (!entry) throw new Error(`Post not found: ${id}`)
  return entry
}

export function getSortedPostsData(lang: Locale = 'en') {
  return listIds('posts')
    .map((id) => ({
      id,
      tags: postTags[id] || [],
      ...readMeta(readPost(id, lang).data),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getAllPostIds() {
  return listIds('posts').map((id) => ({ params: { id } }))
}

export async function getPostData(id: string, lang: Locale = 'en') {
  const entry = readPost(id, lang)
  const meta = readMeta(entry.data)

  return {
    id,
    ...(await renderBody(entry.content)),
    ...meta,
    tags: postTags[id] || [],
    description: meta.summary,
  }
}
