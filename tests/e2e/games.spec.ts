import { test, expect } from './fixtures'

test('games page: switch games, play Reaction Time', async ({ page }) => {
  await page.goto('/games')
  await expect(page.getByRole('heading', { name: 'Games' })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Stack Match' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByRole('button', { name: /^Card \d+, face down$/ })).toHaveCount(16)

  await page.getByRole('tab', { name: 'Reaction Time' }).click()
  await expect(page).toHaveURL(/#reaction$/)
  const panel = page.getByRole('button', { name: 'Click to start' })
  await panel.click()
  await expect(page.getByRole('button', { name: 'Now!' })).toBeVisible({ timeout: 6000 })
  await page.getByRole('button', { name: 'Now!' }).click()
  await expect(page.getByRole('button', { name: /\d+ ms/ })).toBeVisible()
})

test('games page in Arabic opens the game from the link', async ({ page }) => {
  await page.goto('/ar/games#snake')
  await expect(page.getByRole('tab', { name: 'الثعبان' })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'ابدأ' }).click()
  await expect(page.getByRole('button', { name: 'إيقاف مؤقت' })).toBeVisible()
})
