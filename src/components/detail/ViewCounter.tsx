import { useState, useEffect } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { plural } from '@/i18n/config'

/** Views of a page in both languages; `path` is the unprefixed path. */
export default function ViewCounter({ path }: { path: string }) {
  const { lang, dict } = useI18n()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/views?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(0))
  }, [path])

  if (count === null) return null

  return (
    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
      {plural(lang, dict.common.views, count)}
    </span>
  )
}
