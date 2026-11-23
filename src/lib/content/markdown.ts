import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import type { Locale } from '@/i18n/config'

const contentRoot = path.join(process.cwd(), 'content')

/**
 * Headings for the table of contents. Ids come from the same slugger that
 * rehype-slug uses, so they match the rendered headings (Arabic included).
 */
export function extractHeadings(md: string) {
  const slugger = new GithubSlugger()
  const headingRe = /^(#{2,3})\s+(.+)$/gm
  const headings: { depth: number; text: string; id: string }[] = []
  let match: RegExpExecArray | null
  while ((match = headingRe.exec(md)) !== null) {
    const text = match[2].trim()
    headings.push({ depth: match[1].length, text, id: slugger.slug(text) })
  }
  return headings
}

/** Content files write lists as "• item" lines; turn them into real markdown list items. */
export function normalizeBullets(md: string) {
  return md.replace(/^[ \t]*•[ \t]*/gm, '- ')
}

/** Ids of the entries in a content folder ("posts" or "experience"). */
export function listIds(folder: string) {
  return fs
    .readdirSync(path.join(contentRoot, folder))
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => f.replace(/\.mdx?$/, ''))
}

function findFile(dir: string, id: string) {
  if (!fs.existsSync(dir)) return null
  const file = fs.readdirSync(dir).find((f) => f.replace(/\.mdx?$/, '') === id && /\.mdx?$/.test(f))
  return file ? path.join(dir, file) : null
}

/**
 * Reads an entry in `lang`. Translations live in content/<lang>/<folder> and
 * only need the translated fields: anything they leave out (dates, links,
 * screenshots, or the whole file) falls back to the English original.
 */
export function readEntry(folder: string, id: string, lang: Locale) {
  const original = findFile(path.join(contentRoot, folder), id)
  if (!original) return null
  // Only content/ is read; next.config.mjs includes it in the server output
  const base = matter(fs.readFileSync(/*turbopackIgnore: true*/ original, 'utf8'))

  const translatedFile = lang === 'en' ? null : findFile(path.join(contentRoot, lang, folder), id)
  if (!translatedFile) return { data: base.data, content: base.content }

  const translated = matter(fs.readFileSync(/*turbopackIgnore: true*/ translatedFile, 'utf8'))
  return {
    data: { ...base.data, ...translated.data },
    content: translated.content.trim() ? translated.content : base.content,
  }
}

/** Markdown body to HTML, plus the table of contents and reading time. */
export async function renderBody(md: string) {
  const wordCount = md.split(/\s+/g).filter(Boolean).length
  const contentHtml = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeStringify)
    .process(normalizeBullets(md))
    .then((r) => r.toString())
    // Code blocks scroll sideways, so keyboard users must be able to focus them
    .then((html) => html.replaceAll('<pre>', '<pre tabindex="0">'))

  return {
    contentHtml,
    readingTime: Math.max(1, Math.ceil(wordCount / 200)),
    headings: extractHeadings(md).filter((h) => h.depth >= 2),
  }
}
