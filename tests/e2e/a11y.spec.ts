import { AxeBuilder } from '@axe-core/playwright'
import { test, expect } from './fixtures'

/**
 * Automated accessibility checks (axe, WCAG 2.1 A and AA) on the main pages,
 * in both themes and both languages. Catches contrast, labels, landmarks and
 * keyboard reachability; it doesn't replace trying the site with a keyboard
 * and a screen reader.
 */
const pages = ['/', '/ar', '/posts/rehlte', '/ar/posts/kptc', '/faq', '/games', '/guestbook']

for (const theme of ['light', 'dark'] as const) {
  test.describe(`${theme} theme`, () => {
    test.use({ colorScheme: theme })

    for (const path of pages) {
      test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme)
        // Let the entrance animations finish, so colours are measured at rest
        await page.waitForTimeout(800)
        const { violations } = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze()
        const summary = violations.map(
          (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
        )
        expect(summary).toEqual([])
      })
    }
  })
}
