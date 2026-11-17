import { test as base, expect } from '@playwright/test'

/**
 * Every test: page views are never sent, so test runs can't reach analytics,
 * and requests carry their own client address, so the rate limits (per
 * address) don't carry over from one test to the next.
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    const ip = `198.51.100.${hash(`${testInfo.testId}:${testInfo.retry}`) % 250}`
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': ip })
    await page.route('**/api/track', (route) => route.fulfill({ status: 204 }))
    await use(page)
  },
})

function hash(s: string) {
  let h = 0
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 1000
  return h
}

export { expect }
