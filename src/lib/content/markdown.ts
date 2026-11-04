export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function extractHeadings(md: string) {
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

/** Content files write lists as "• item" lines; turn them into real markdown list items. */
export function normalizeBullets(md: string) {
  return md.replace(/^[ \t]*•[ \t]*/gm, '- ')
}
