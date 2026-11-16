/**
 * Runs `fn` once the page has loaded and the browser is idle, so optional
 * extras (background animation, smooth scrolling) don't compete with the first
 * paint and hydration. Returns a cancel function.
 */
export default function whenIdle(fn: () => void, timeout = 3000) {
  let cancelled = false
  let idleId: number | undefined
  let timerId: ReturnType<typeof setTimeout> | undefined

  const schedule = () => {
    if (cancelled) return
    if ('requestIdleCallback' in window)
      idleId = window.requestIdleCallback(() => fn(), { timeout })
    else timerId = setTimeout(fn, 1)
  }

  if (document.readyState === 'complete') schedule()
  else window.addEventListener('load', schedule, { once: true })

  return () => {
    cancelled = true
    window.removeEventListener('load', schedule)
    if (idleId !== undefined) window.cancelIdleCallback(idleId)
    if (timerId !== undefined) clearTimeout(timerId)
  }
}
