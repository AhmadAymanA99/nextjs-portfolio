import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import { experienceTags } from './tags'

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
  let match
  while ((match = headingRe.exec(md)) !== null) {
    headings.push({
      depth: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2].trim()),
    })
  }
  return headings
}

const experienceDirectory = path.join(process.cwd(), 'Experience')

export function getSortedExperiencesData() {
  // Get file names under /experience
  const fileNames = fs.readdirSync(experienceDirectory)
  const allExperiencesData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(experienceDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    const data = matterResult.data as Record<string, unknown>
    return {
      id,
      tags: experienceTags[id] || [],
      ...data,
      date: data.date as string,
    }
  })
  // Sort posts by date
  return allExperiencesData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export function getAllExperienceIds() {
  const fileNames = fs.readdirSync(experienceDirectory)
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ''),
      },
    }
  })
}

export async function getExperienceData(id: string) {
  const fullPath = path.join(experienceDirectory, `${id}.md`)
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
    till: data.till as string,
  }
}
