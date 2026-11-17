import { defineConfig, devices } from '@playwright/test'

const PORT = 3100

/**
 * End-to-end tests against a production build. The server gets a test admin
 * password and a database address that can't be reached, so nothing here
 * touches real data: pages fall back to empty states, the rate limiter counts
 * in memory, and tests stub the API calls that would need the database.
 * In CI the build already exists; locally it is built first.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: process.env.CI
      ? `npx next start -p ${PORT}`
      : `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ADMIN_SECRET: 'e2e-secret',
      POSTGRES_URL: 'postgresql://e2e:e2e@127.0.0.1:1/e2e',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
      SMTP_HOST: '',
    },
  },
})
