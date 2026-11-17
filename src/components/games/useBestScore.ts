'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * A personal best kept in this browser's localStorage. Storage can be missing
 * or blocked (private windows), so every access is guarded and the game still
 * works without it.
 */
export function useBestScore(key: string, better: (a: number, b: number) => boolean) {
  const storageKey = `games:best:${key}`
  const [best, setBest] = useState<number | null>(null)

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey))
      // Read after hydration so the server and first client render match
      if (saved > 0) setBest(saved)
    } catch {}
  }, [storageKey])

  const submit = useCallback(
    (value: number) => {
      setBest((current) => {
        if (current !== null && !better(value, current)) return current
        try {
          localStorage.setItem(storageKey, String(value))
        } catch {}
        return value
      })
    },
    [storageKey, better],
  )

  return [best, submit] as const
}

export const higher = (a: number, b: number) => a > b
export const lower = (a: number, b: number) => a < b
