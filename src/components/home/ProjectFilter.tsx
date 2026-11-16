'use client'

import { useState, type ReactNode } from 'react'
import Reveal from '@/components/ui/Reveal'
import styles from './BentoHome.module.css'

type Item = { id: string; tags: string[]; content: ReactNode }

/**
 * Tag filter for the project list. The rows are rendered on the server and
 * passed in, so only the filter itself runs in the browser.
 */
export default function ProjectFilter({
  tags,
  items,
  allLabel,
  emptyLabel,
}: {
  tags: { value: string; label: string }[]
  items: Item[]
  allLabel: string
  emptyLabel: string
}) {
  const [active, setActive] = useState<string | null>(null)
  const [filtered, setFiltered] = useState(false)
  const select = (tag: string | null) => {
    setActive(tag)
    setFiltered(true)
  }
  const shown = active ? items.filter((i) => i.tags.includes(active)) : items

  return (
    <>
      <div className={styles.filterRow}>
        <button
          className={`${styles.filterTag} ${active === null ? styles.filterTagActive : ''}`}
          aria-pressed={active === null}
          onClick={() => select(null)}
        >
          {allLabel}
        </button>
        {tags.map(({ value, label }) => (
          <button
            key={value}
            className={`${styles.filterTag} ${active === value ? styles.filterTagActive : ''}`}
            aria-pressed={active === value}
            onClick={() => select(active === value ? null : value)}
          >
            {label}
          </button>
        ))}
      </div>
      {/* Rows fade in as they scroll into view; after a filter click they rise
          in one after another (the key remounts them) */}
      <div key={active ?? 'all'} className={styles.projectList}>
        {shown.length === 0 ? (
          <p className={styles.emptyState}>{emptyLabel}</p>
        ) : (
          shown.map((item, i) => (
            <Reveal
              key={item.id}
              on={filtered ? 'load' : 'scroll'}
              delay={filtered ? Math.min(i * 0.05, 0.4) : 0}
            >
              {item.content}
            </Reveal>
          ))
        )}
      </div>
    </>
  )
}
