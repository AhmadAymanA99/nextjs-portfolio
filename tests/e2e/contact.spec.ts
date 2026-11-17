import { test, expect } from './fixtures'

test('contact form sends the message and thanks the visitor', async ({ page }) => {
  let sent: Record<string, string> | null = null
  // The real endpoint stores the message in the database; stub it and check the request
  await page.route('**/api/contact', async (route) => {
    sent = route.request().postDataJSON()
    await route.fulfill({ json: { success: true } })
  })

  await page.goto('/')
  await page.getByRole('textbox', { name: 'Your name' }).fill('Test Visitor')
  await page.getByRole('textbox', { name: 'Your email' }).fill('visitor@example.com')
  await page.getByRole('textbox', { name: 'Subject' }).fill('Hello')
  await page.getByRole('textbox', { name: 'Your message' }).fill('Testing the contact form.')
  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(page.getByText("Thanks for reaching out! I'll get back to you soon.")).toBeVisible()
  expect(sent).toMatchObject({
    name: 'Test Visitor',
    email: 'visitor@example.com',
    subject: 'Hello',
    message: 'Testing the contact form.',
  })
})

test('contact form shows the error from the server', async ({ page }) => {
  await page.route('**/api/contact', (route) =>
    route.fulfill({ status: 429, json: { error: 'Too many requests' } }),
  )
  await page.goto('/')
  await page.getByRole('textbox', { name: 'Your name' }).fill('Test Visitor')
  await page.getByRole('textbox', { name: 'Your email' }).fill('visitor@example.com')
  await page.getByRole('textbox', { name: 'Your message' }).fill('Hi')
  await page.getByRole('button', { name: 'Send Message' }).click()
  await expect(page.getByText('Too many requests')).toBeVisible()
})

test('contact API validates input before storing anything', async ({ request }) => {
  const res = await request.post('/api/contact', {
    data: { name: 'A', email: 'not-an-email', message: 'Hi' },
  })
  expect(res.status()).toBe(400)
  expect(await res.json()).toEqual({ error: 'Invalid email address' })
})
