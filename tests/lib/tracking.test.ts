import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const fetchMock = vi.fn(() => Promise.resolve(new Response(null)))
vi.stubGlobal('fetch', fetchMock)

// The module keeps per-tab state, so load a fresh copy for every test
async function load() {
  vi.resetModules()
  return import('@/lib/tracking')
}
const sentPaths = () =>
  fetchMock.mock.calls.map((c: any[]) => JSON.parse((c[1] as RequestInit).body as string).path)

beforeEach(() => {
  fetchMock.mockClear()
  sessionStorage.clear()
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true })
})

// A test that leaves a view waiting keeps its listeners on window; release them
afterEach(() => {
  Object.defineProperty(navigator, 'webdriver', { value: false, configurable: true })
  window.dispatchEvent(new Event('pointerdown'))
})

describe('trackPageView', () => {
  it('waits for a person to interact before counting the view', async () => {
    const { trackPageView } = await load()
    trackPageView('/posts/rehlte', 'direct')
    expect(fetchMock).not.toHaveBeenCalled()

    window.dispatchEvent(new Event('pointermove'))
    expect(sentPaths()).toEqual(['/posts/rehlte'])

    // Later views in the tab go straight out
    trackPageView('/faq', 'internal')
    expect(sentPaths()).toEqual(['/posts/rehlte', '/faq'])
  })

  it('never counts a visit nobody interacts with', async () => {
    const { trackPageView } = await load()
    trackPageView('/', 'direct')
    window.dispatchEvent(new Event('scroll')) // scripts scroll too
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('remembers a confirmed visitor across page loads in the tab', async () => {
    sessionStorage.setItem('human', '1')
    const { trackPageView } = await load()
    trackPageView('/ar', 'direct')
    expect(sentPaths()).toEqual(['/ar'])
  })

  it('ignores automated browsers', async () => {
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    const { trackPageView } = await load()
    trackPageView('/', 'direct')
    window.dispatchEvent(new Event('pointerdown'))
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
