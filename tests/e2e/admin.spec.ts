import { test, expect } from './fixtures'

test('wrong password shows an error', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByLabel('Password').fill('not-the-password')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.getByText('Invalid password')).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('dashboard sends signed-out visitors to the login page', async ({ page }) => {
  await page.goto('/admin/analytics')
  await expect(page).toHaveURL(/\/admin\/login$/)
})

test('sign in with a session cookie scripts cannot read, then log out', async ({
  page,
  context,
}) => {
  // Inbox and guestbook come from the database; stub them with empty lists
  await page.route('**/api/admin/messages', (route) => route.fulfill({ json: { messages: [] } }))
  await page.route('**/api/admin/guestbook', (route) => route.fulfill({ json: { entries: [] } }))

  await page.goto('/admin/login')
  await page.getByLabel('Password').fill('e2e-secret')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL(/\/admin\/analytics/)
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  const [cookie] = (await context.cookies()).filter((c) => c.name === 'admin_session')
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Strict', path: '/api/admin' })
  expect(await page.evaluate(() => document.cookie)).not.toContain('admin_session')
  expect(await page.evaluate(() => localStorage.getItem('admin_token'))).toBeNull()

  // The cookie alone opens the API
  expect((await page.request.get('/api/admin/session')).status()).toBe(200)

  await page.getByRole('button', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/admin\/login$/)
  expect((await context.cookies()).some((c) => c.name === 'admin_session')).toBe(false)
  expect((await page.request.get('/api/admin/session')).status()).toBe(401)
})
