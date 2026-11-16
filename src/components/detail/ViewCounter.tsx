'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { plural } from '@/i18n/config'

/** Views of a page in both languages; `path` is the unprefixed path. */
export default function ViewCounter({ path }: { path: string }) {
  const { lang, dict } = useI18n()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/views?path=${encodeURIComponent(path)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCount(typeof d?.count === 'number' ? d.count : null))
      .catch(() => setCount(null))
  }, [path])

  // Hidden while loading, or if the count is unavailable (e.g. database down)
  if (count === null) return null

  return (
    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      {plural(lang, dict.common.views, count)}
    </span>
  )
}
