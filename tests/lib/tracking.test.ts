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

describe('trackActions', () => {
  const sent = () =>
    fetchMock.mock.calls.map((c: any[]) => JSON.parse((c[1] as RequestInit).body as string))

  function link(attrs: Record<string, string>) {
    const a = document.createElement('a')
    a.href = '#'
    for (const [k, v] of Object.entries(attrs)) a.setAttribute(k, v)
    a.innerHTML = '<span>label</span>'
    document.body.appendChild(a)
    return a
  }

  afterEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
  })

  it('sends clicks on marked links, with the page and target', async () => {
    const { trackActions } = await load()
    const stop = trackActions(() => '/posts/kptc')
    const a = link({ 'data-track': 'live_site', 'data-track-target': 'kptc' })
    a.querySelector('span')!.click() // a click inside the link counts
    link({}).click() // unmarked links don't
    expect(sent()).toEqual([{ action: 'live_site', path: '/posts/kptc', target: 'kptc' }])
    stop()
    a.click()
    expect(sent()).toHaveLength(1)
  })

  it('skips the owner and automated browsers', async () => {
    const { trackActions, setTrackingDisabled } = await load()
    const stop = trackActions(() => '/')
    const a = link({ 'data-track': 'cv_download' })
    setTrackingDisabled(true)
    a.click()
    setTrackingDisabled(false)
    Object.defineProperty(navigator, 'webdriver', { value: true, configurable: true })
    a.click()
    expect(fetchMock).not.toHaveBeenCalled()
    stop()
  })
})
