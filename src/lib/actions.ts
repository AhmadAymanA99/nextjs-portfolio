/**
 * Actions a visitor can take that are worth counting, beyond page views.
 * Links opt in with `data-track="<name>"` (and optionally
 * `data-track-target`); see lib/tracking.ts. Shared by the browser, the
 * /api/track endpoint and the admin.
 */
export const ACTIONS = {
  contact_click: 'Contact me / Get in touch',
  cv_download: 'CV downloads',
  message_link: 'Email, WhatsApp or Telegram',
  live_site: 'Live site links',
} as const

export type ActionName = keyof typeof ACTIONS

export const isAction = (name: unknown): name is ActionName =>
  typeof name === 'string' && Object.hasOwn(ACTIONS, name)
