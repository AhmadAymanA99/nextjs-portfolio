// Set on this browser when the admin signs in, so the owner's own visits are
// not counted. Kept after logout on purpose.
const KEY = 'no_track'
// Set once this tab has seen a real person interact with the site
const HUMAN_KEY = 'human'

export function isTrackingDisabled() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function setTrackingDisabled(disabled: boolean) {
  try {
    if (disabled) localStorage.setItem(KEY, '1')
    else localStorage.removeItem(KEY)
  } catch {}
}

/**
 * Input that a person produces and that link scanners and crawlers, which
 * only load and render the page, don't. (Not "scroll": scripts scroll too.)
 */
const HUMAN_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'] as const

let confirmed = false
let pending: { path: string; referrer: string } | null = null

function isConfirmedHuman() {
  if (confirmed) return true
  try {
    confirmed = sessionStorage.getItem(HUMAN_KEY) === '1'
  } catch {}
  return confirmed
}

function send(view: { path: string; referrer: string }) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(view),
    keepalive: true,
  }).catch(() => {})
}

function onHumanInput() {
  confirmed = true
  try {
    sessionStorage.setItem(HUMAN_KEY, '1')
  } catch {}
  HUMAN_EVENTS.forEach((e) => window.removeEventListener(e, onHumanInput, true))
  if (pending) send(pending)
  pending = null
}

/**
 * Records a page view, but only once a person has interacted with the page:
 * until then the view waits, and it is dropped if nobody ever does (an
 * automated visit). Later views in the same tab are sent straight away.
 */
export function trackPageView(path: string, referrer: string) {
  if (navigator.webdriver) return // browser automation
  if (isConfirmedHuman()) return send({ path, referrer })

  const waiting = pending !== null
  pending = { path, referrer }
  if (!waiting) {
    HUMAN_EVENTS.forEach((e) =>
      window.addEventListener(e, onHumanInput, { capture: true, passive: true }),
    )
  }
}
