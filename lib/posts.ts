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

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    const data = matterResult.data as Record<string, unknown>
    return {
      id,
      tags: postTags[id] || [],
      ...data,
      date: data.date as string,
    }
  })
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map((fileName) => ({
    params: {
      id: fileName.replace(/\.md$/, ''),
    },
  }))
}

export async function getPostData(id: string) {
  const fullPath = path.join(postsDirectory, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)
  const data = matterResult.data as Record<string, unknown>

  const wordCount = matterResult.content.split(/\s+/g).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const headings = extractHeadings(matterResult.content)

  // Use remark to convert markdown into HTML string with syntax highlighting
  const processedContent = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id and contentHtml
  return {
    id,
    contentHtml,
    readingTime,
    headings: headings.filter((h) => h.depth >= 2),
    title: data.title as string,
    date: data.date as string,
    tags: (data.tags as string[]) || [],
  }
}
