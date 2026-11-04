'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

export const TOKEN_KEY = 'admin_token'

/**
 * Fetch wrapper for admin endpoints: attaches the bearer token, sends JSON
 * bodies, redirects to login on 401 and throws with the API's error message.
 */
export function useAdminApi() {
  const router = useRouter()

  return useCallback(
    async (path: string, init: { method?: string; body?: unknown } = {}) => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        router.replace('/admin/login')
        throw new Error('Not signed in')
      }

      const res = await fetch(path, {
        method: init.method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      })

      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY)
        router.replace('/admin/login')
        throw new Error('Session expired')
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      return res
    },
    [router],
  )
}

export function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000
  if (!Number.isFinite(diff)) return '—'
  if (diff < 60) return 'just now'
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'y'],
    [60 * 60 * 24 * 30, 'mo'],
    [60 * 60 * 24, 'd'],
    [60 * 60, 'h'],
    [60, 'm'],
  ]
  for (const [secs, label] of units) {
    if (diff >= secs) return `${Math.floor(diff / secs)}${label} ago`
  }
  return 'just now'
}
