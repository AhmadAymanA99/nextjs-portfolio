// @vitest-environment node
import { describe, it, expect, vi } from 'vitest'
import { getAllPostIds, getPostData, getSortedPostsData } from '@/lib/content/posts'
import { getAllExperienceIds, getSortedExperiencesData } from '@/lib/content/experience'
import { extractHeadings } from '@/lib/content/markdown'

describe('Arabic content', () => {
  it('has a translation for every project and experience', () => {
    const posts = getSortedPostsData('ar')
    const en = getSortedPostsData('en')
    expect(posts).toHaveLength(getAllPostIds().length)
    posts.forEach((p, i) => {
      expect(p.id).toBe(en[i].id)
      expect(p.summary).not.toBe(en[i].summary)
    })
    expect(getSortedExperiencesData('ar')).toHaveLength(getAllExperienceIds().length)
  })

  it('takes untranslated fields from the English file', async () => {
    const [en, ar] = await Promise.all([getPostData('rehlte', 'en'), getPostData('rehlte', 'ar')])
    expect(ar.date).toBe(en.date)
    expect(ar.link).toBe(en.link)
    expect(ar.stack).toEqual(en.stack)
    expect(ar.screenshots).toEqual(en.screenshots)
    expect(ar.role).not.toBe(en.role)
  })

  it('gives Arabic headings ids that match the rendered HTML', async () => {
    const post = await getPostData('rehlte', 'ar')
    expect(post.headings.length).toBeGreaterThan(1)
    post.headings.forEach((h) => {
      expect(h.id).not.toBe('')
      expect(post.contentHtml).toContain(`id="${h.id}"`)
    })
  })
})

describe('extractHeadings', () => {
  it('gives repeated headings unique ids', () => {
    const ids = extractHeadings('## Notes\n\n## Notes\n').map((h) => h.id)
    expect(ids).toEqual(['notes', 'notes-1'])
  })
})

describe('articles', () => {
  it('loads every article with a title, date and summary', async () => {
    const { getSortedArticles, getArticle } = await import('@/lib/content/articles')
    const articles = getSortedArticles()
    for (const a of articles) {
      expect(a.title).toBeTruthy()
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(a.summary).toBeTruthy()
      const full = await getArticle(a.id)
      expect(full.contentHtml).toContain('<h2')
    }
  })

  it('leaves drafts out of production', async () => {
    vi.resetModules()
    vi.stubEnv('NODE_ENV', 'production')
    const { getArticleIds } = await import('@/lib/content/articles')
    expect(getArticleIds()).not.toContain('bilingual-nextjs-rtl')
    vi.unstubAllEnvs()
  })
})
