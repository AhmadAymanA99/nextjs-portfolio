// Set on this browser when the admin signs in, so the owner's own visits are
// not counted. Kept after logout on purpose.
const KEY = 'no_track'

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
